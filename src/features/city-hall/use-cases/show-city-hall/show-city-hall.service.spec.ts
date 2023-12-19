import { CityHall } from '@prisma/client'

import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { CityHallNotFoundError } from '../errors'
import { CREATE_CITY_HALL_DATA } from '../test-helper'

import { ShowCityHallService } from './show-city-hall.service'

let cityHall: CityHall
let repository: InMemoryCityHallRepository
let showCityHallService: ShowCityHallService

describe('Show city hall', () => {
  beforeAll(async () => {
    repository = new InMemoryCityHallRepository()
    showCityHallService = new ShowCityHallService(repository)

    cityHall = await repository.create(CREATE_CITY_HALL_DATA)
  })

  it('should be able to show a city hall', async () => {
    const result = await showCityHallService.execute(cityHall.id)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        ...CREATE_CITY_HALL_DATA,
        id: expect.any(String),
      })
    )
  })

  it('should be able to show a city hall with includes', async () => {
    const includes = 'neighborhoods,sub_city_halls'
    const result = await showCityHallService.execute(cityHall.id, includes)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        ...CREATE_CITY_HALL_DATA,
        id: expect.any(String),
        neighborhoods: [],
        subCityHalls: [],
      })
    )
  })

  it('should not be able to show a nonexistent city hall', async () => {
    const result = await showCityHallService.execute('invalid-city-hall-id')
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })
})
