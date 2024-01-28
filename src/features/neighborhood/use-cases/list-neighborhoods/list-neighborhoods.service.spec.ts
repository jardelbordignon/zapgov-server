import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/shared/test-helper'

import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { CREATE_NEIGHBORHOOD_DATA } from '../../shared/test-helper'

import { ListNeighborhoodsService } from './list-neighborhoods.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository

let city_hall_id: string
let sub_city_hall_id: string

let neighborhoodRepository: InMemoryNeighborhoodRepository
let service: ListNeighborhoodsService

const neighborhoodNames = ['Neighborhood A', 'Neighborhood B', 'Neighborhood C']

describe('List neighborhoods', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    service = new ListNeighborhoodsService(neighborhoodRepository)

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id

    const subCityHall = await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)
    sub_city_hall_id = subCityHall.id

    for (const name of neighborhoodNames) {
      await neighborhoodRepository.create({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
        name,
        sub_city_hall_id,
      })
    }
  })

  it('should be able to list the neighborhoods', async () => {
    const result = await service.execute()

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(neighborhoodNames.length)
    expect(result.value).toEqual({
      data: expect.arrayContaining([
        expect.objectContaining({
          city_hall_id,
          name: 'Neighborhood A',
          sub_city_hall_id,
        }),
        expect.objectContaining({ name: 'Neighborhood B' }),
        expect.objectContaining({ name: 'Neighborhood C' }),
      ]),
      meta: {
        hasNext: false,
        hasPrevious: false,
        page: 1,
        perPage: 20,
        totalItems: 3,
        totalPages: 1,
      },
    })
  })

  it('should be able to list the filtered neighborhoods', async () => {
    const result = await service.execute({ filter: 'name:c' })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(1)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Neighborhood C' })])
    )
  })
})
