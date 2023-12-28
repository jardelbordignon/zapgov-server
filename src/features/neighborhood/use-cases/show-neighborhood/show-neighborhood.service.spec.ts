import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { InMemorySubCityHallRepository } from 'src/features/sub-city-hall/repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from 'src/features/sub-city-hall/shared/test-helper'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { CREATE_NEIGHBORHOOD_DATA } from '../../shared/test-helper'
import { NeighborhoodNotFoundError } from '../errors'

import { ShowNeighborhoodService } from './show-neighborhood.service'

let cityHallRepository: InMemoryCityHallRepository
let subCityHallRepository: InMemorySubCityHallRepository
let neighborhoodRepository: InMemoryNeighborhoodRepository
let i18n: I18n
let showNeighborhoodService: ShowNeighborhoodService
let neighborhood: NeighborhoodEntity

describe('Show neighborhood', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    i18n = new I18n()
    showNeighborhoodService = new ShowNeighborhoodService(
      neighborhoodRepository,
      i18n
    )
    subCityHallRepository = new InMemorySubCityHallRepository()

    await neighborhoodRepository.create(CREATE_NEIGHBORHOOD_DATA)

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    const subCityHall = await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)

    neighborhood = await neighborhoodRepository.create({
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id: cityHall.id,
      sub_city_hall_id: subCityHall.id,
    })
  })

  it('should be able to show a neighborhood', async () => {
    const result = await showNeighborhoodService.execute(neighborhood.id)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(expect.objectContaining({ id: neighborhood.id }))
  })

  it('should not be able to show a nonexistent neighborhood', async () => {
    const result = await showNeighborhoodService.execute('invalid-neighborhood-id')
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NeighborhoodNotFoundError)
  })
})
