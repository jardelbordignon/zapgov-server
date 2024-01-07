import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/shared/test-helper'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { CREATE_NEIGHBORHOOD_DATA } from '../../shared/test-helper'
import { NeighborhoodAlreadyExistsError, NeighborhoodNotFoundError } from '../errors'

import { UpdateNeighborhoodService } from './update-neighborhood.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository
let city_hall_id: string
let sub_city_hall_id: string

let neighborhoodRepository: InMemoryNeighborhoodRepository
let i18n: I18n
let updateNeighborhoodService: UpdateNeighborhoodService

describe('Update neighborhood', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    i18n = new I18n()
    updateNeighborhoodService = new UpdateNeighborhoodService(
      neighborhoodRepository,
      i18n
    )

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id

    const subCityHall = await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)
    sub_city_hall_id = subCityHall.id
  })

  beforeEach(async () => {
    await neighborhoodRepository.create({
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      sub_city_hall_id,
    })
  })

  afterEach(async () => {
    const getAll = await neighborhoodRepository.findAll({ page: 1, perPage: 100 })
    for (const item of getAll.data) {
      await neighborhoodRepository.delete(item.id)
    }
  })

  it('should be able to update a neighborhood', async () => {
    const item = await neighborhoodRepository.findByName(
      CREATE_NEIGHBORHOOD_DATA.name
    )
    const name = `Updated ${CREATE_NEIGHBORHOOD_DATA.name}`
    const result = await updateNeighborhoodService.execute(item!.id, { name })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(expect.objectContaining({ name }))
  })

  it('should not be able to update a nonexistent neighborhood', async () => {
    const result = await updateNeighborhoodService.execute('nonexistent-id', {
      name: 'name',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NeighborhoodNotFoundError)
  })

  it('should not be able to update the name using one already in use', async () => {
    const name = 'New neighborhood'

    await neighborhoodRepository.create({
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      name,
      sub_city_hall_id,
    })

    const newItem = await neighborhoodRepository.findByName(name)

    const result = await updateNeighborhoodService.execute(newItem!.id, {
      name: CREATE_NEIGHBORHOOD_DATA.name,
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NeighborhoodAlreadyExistsError)
  })
})
