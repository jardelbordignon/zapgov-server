import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../../shared/test-helper'
import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { SubCityHallAlreadyExistsError, SubCityHallNotFoundError } from '../errors'

import { UpdateSubCityHallService } from './update-sub-city-hall.service'

let cityHallRepository: InMemoryCityHallRepository
let city_hall_id: string

let i18n: I18n
let subCityHallRepository: InMemorySubCityHallRepository
let updateSubCityHallService: UpdateSubCityHallService
let subCityHall: SubCityHallEntity

describe('Update user', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    i18n = new I18n()
    subCityHallRepository = new InMemorySubCityHallRepository()

    updateSubCityHallService = new UpdateSubCityHallService(
      subCityHallRepository,
      i18n
    )

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id
  })

  beforeEach(async () => {
    subCityHall = await subCityHallRepository.create({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id,
    })
  })

  afterEach(async () => {
    const getItems = await subCityHallRepository.findAll({ page: 1, perPage: 100 })
    const getDeletedItems = await subCityHallRepository.findAll({
      deleted: true,
      page: 1,
      perPage: 100,
    })
    const allItems = [...getItems.data, ...getDeletedItems.data]
    for (const item of allItems) {
      await subCityHallRepository.delete(item.id)
    }
  })

  it('should be able to update a sub city hall', async () => {
    const name = `Updated ${CREATE_SUB_CITY_HALL_DATA.name}`
    const result = await updateSubCityHallService.execute(subCityHall.id, { name })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(expect.objectContaining({ name }))
  })

  it('should not be able to update a nonexistent sub city hall', async () => {
    const result = await updateSubCityHallService.execute('nonexistent-id', {
      name: 'name',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(SubCityHallNotFoundError)
  })

  it('should not be able to update the email using an address already in use', async () => {
    const emailAddress = 'new-sub-city-hall@email.com'

    await subCityHallRepository.create({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id,
      email: emailAddress,
      name: 'New Sub City Hall',
    })

    const newItem = await subCityHallRepository.findByEmail(emailAddress)

    const result = await updateSubCityHallService.execute(newItem!.id, {
      email: CREATE_SUB_CITY_HALL_DATA.email,
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(SubCityHallAlreadyExistsError)
  })
})
