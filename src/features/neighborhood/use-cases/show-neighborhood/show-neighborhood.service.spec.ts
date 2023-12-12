import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/use-cases/test-helper'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/use-cases/test-helper'

import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { NeighborhoodNotFoundError } from '../errors'
import { CREATE_NEIGHBORHOOD_DATA } from '../test-helper'

import { ShowNeighborhoodService } from './show-neighborhood.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository
let neighborhoodRepository: InMemoryNeighborhoodRepository
let showNeighborhoodService: ShowNeighborhoodService

describe('Show neighborhood', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    showNeighborhoodService = new ShowNeighborhoodService(neighborhoodRepository)
    subCityHallRepository = new InMemorySubCityHallRepository()

    await neighborhoodRepository.create(CREATE_NEIGHBORHOOD_DATA)

    await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    const cityHall = await cityHallRepository.findByEmail(CREATE_CITY_HALL_DATA.email)

    await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)
    const subCityHall = await subCityHallRepository.findByEmail(
      CREATE_SUB_CITY_HALL_DATA.email
    )

    await neighborhoodRepository.create({
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id: cityHall.id,
      sub_city_hall_id: subCityHall.id,
    })
  })

  it('should be able to show a neighborhood', async () => {
    const { id } = await neighborhoodRepository.findByName(
      CREATE_NEIGHBORHOOD_DATA.name
    )
    const result = await showNeighborhoodService.execute(id)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        ...CREATE_NEIGHBORHOOD_DATA,
        id: expect.any(String),
      })
    )
  })

  it('should not be able to show a nonexistent neighborhood', async () => {
    const result = await showNeighborhoodService.execute('invalid-neighborhood-id')
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NeighborhoodNotFoundError)
  })
})
