import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/use-cases/test-helper'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/use-cases/test-helper'

import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { NeighborhoodAlreadyExistsError, NeighborhoodNotFoundError } from '../errors'
import { CREATE_NEIGHBORHOOD_DATA } from '../test-helper'

import { UpdateNeighborhoodService } from './update-neighborhood.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository
let city_hall_id: string
let sub_city_hall_id: string

let neighborhoodRepository: InMemoryNeighborhoodRepository
let updateNeighborhoodService: UpdateNeighborhoodService

describe('Update neighborhood', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    updateNeighborhoodService = new UpdateNeighborhoodService(neighborhoodRepository)

    await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    const cityHall = await cityHallRepository.findByEmail(CREATE_CITY_HALL_DATA.email)
    city_hall_id = cityHall.id

    await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)
    const subCityHall = await subCityHallRepository.findByEmail(
      CREATE_SUB_CITY_HALL_DATA.email
    )
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
    const pg = { page: 1, perPage: 100 }
    const getItems = await neighborhoodRepository.findAll(pg)
    const getDeletedItems = await neighborhoodRepository.findAllDeleted(pg)
    const allItems = [...getItems.data, ...getDeletedItems.data]
    for (const item of allItems) {
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
