import { CreateNeighborhoodData } from 'src/contracts/neighborhoods'
import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/use-cases/test-helper'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { SubCityHallNotFoundError } from 'src/features/sub-city-hall/use-cases/errors'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/use-cases/test-helper'

import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { NeighborhoodAlreadyExistsError } from '../errors'
import { CREATE_NEIGHBORHOOD_DATA } from '../test-helper'

import { CreateNeighborhoodService } from './create-neighborhood.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository
let neighborhoodRepository: InMemoryNeighborhoodRepository
let service: CreateNeighborhoodService

let city_hall_id: string
let sub_city_hall_id: string

describe('Create neighborhood', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    service = new CreateNeighborhoodService(
      neighborhoodRepository,
      cityHallRepository,
      subCityHallRepository
    )

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
    const getAll = await neighborhoodRepository.findAll({ page: 1, perPage: 100 })
    const getAllDeleted = await neighborhoodRepository.findAllDeleted({
      page: 1,
      perPage: 100,
    })
    const allItems = [...getAll.data, ...getAllDeleted.data]
    for (const item of allItems) {
      await neighborhoodRepository.delete(item.id)
    }
  })

  it('should be able to register a new neighborhood', async () => {
    const data: CreateNeighborhoodData = {
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      name: 'Neighborhood ABC',
      sub_city_hall_id,
    }

    const result = await service.execute(data)
    console.log('result', result)
    expect(result.isSuccess()).toBe(true)
  })

  it('should not be able to register a new neighborhood with a non-existent city hall', async () => {
    const data: CreateNeighborhoodData = {
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id: 'non-existent-city-hall-id',
      name: 'Neighborhood ABC',
      sub_city_hall_id,
    }

    const result = await service.execute(data)
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })

  it('should not be able to register a new neighborhood with a non-existent sub city hall', async () => {
    const data: CreateNeighborhoodData = {
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      name: 'Neighborhood ABC',
      sub_city_hall_id: 'non-existent-sub-city-hall-id',
    }

    const result = await service.execute(data)
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(SubCityHallNotFoundError)
  })

  it('should not be able to register a new neighborhood with same name in a sub city hall', async () => {
    const data: CreateNeighborhoodData = {
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      sub_city_hall_id,
    }

    const result = await service.execute(data)
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NeighborhoodAlreadyExistsError)
  })
})
