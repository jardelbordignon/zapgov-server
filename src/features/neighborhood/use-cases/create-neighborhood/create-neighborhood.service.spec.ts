import { CreateNeighborhoodData } from 'src/contracts/neighborhoods'
import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/shared/test-helper'
import { SubCityHallNotFoundError } from 'src/features/sub-city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { CREATE_NEIGHBORHOOD_DATA } from '../../shared/test-helper'
import { NeighborhoodAlreadyExistsError } from '../errors'

import { CreateNeighborhoodService } from './create-neighborhood.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository
let neighborhoodRepository: InMemoryNeighborhoodRepository
let i18n: I18n
let service: CreateNeighborhoodService

let city_hall_id: string
let sub_city_hall_id: string

describe('Create neighborhood', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    i18n = new I18n()
    service = new CreateNeighborhoodService(
      neighborhoodRepository,
      cityHallRepository,
      subCityHallRepository,
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
    const getAllDeleted = await neighborhoodRepository.findAll({
      deleted: true,
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
