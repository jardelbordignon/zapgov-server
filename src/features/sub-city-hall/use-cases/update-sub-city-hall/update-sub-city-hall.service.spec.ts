import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/use-cases/test-helper'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { SubCityHallAlreadyExistsError, SubCityHallNotFoundError } from '../errors'
import { CREATE_SUB_CITY_HALL_DATA } from '../test-helper'

import { UpdateSubCityHallService } from './update-sub-city-hall.service'

let cityHallRepository: InMemoryCityHallRepository
let city_hall_id: string

let subCityHallRepository: InMemorySubCityHallRepository
let updateSubCityHallService: UpdateSubCityHallService

describe('Update user', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    updateSubCityHallService = new UpdateSubCityHallService(subCityHallRepository)

    await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    const cityHall = await cityHallRepository.findByEmail(CREATE_CITY_HALL_DATA.email)
    city_hall_id = cityHall.id
  })

  beforeEach(async () => {
    await subCityHallRepository.create({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id,
    })
  })

  afterEach(async () => {
    const pg = { page: 1, perPage: 100 }
    const getItems = await subCityHallRepository.findAll(pg)
    const getDeletedItems = await subCityHallRepository.findAllDeleted(pg)
    const allItems = [...getItems.data, ...getDeletedItems.data]
    for (const item of allItems) {
      await subCityHallRepository.delete(item.id)
    }
  })

  it('should be able to update a sub city hall', async () => {
    const item = await subCityHallRepository.findByEmail(
      CREATE_SUB_CITY_HALL_DATA.email
    )
    const name = `Updated ${CREATE_SUB_CITY_HALL_DATA.name}`
    const result = await updateSubCityHallService.execute(item!.id, { name })
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
