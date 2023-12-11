import { CityHallRepository } from '../../repositories/city-hall.repository'
import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { CityHallNotFoundError } from '../errors'
import { CREATE_CITY_HALL_DATA } from '../test-helper'

import { DeleteCityHallService } from './delete-city-hall.service'

let cityHallRepository: CityHallRepository
let deleteCityHallService: DeleteCityHallService

describe('Delete city hall', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    deleteCityHallService = new DeleteCityHallService(cityHallRepository)
  })

  beforeEach(async () => {
    await cityHallRepository.create(CREATE_CITY_HALL_DATA)
  })

  afterEach(async () => {
    const getCityHalls = await cityHallRepository.findAll({ page: 1, perPage: 100 })
    for (const cityHall of getCityHalls.data) {
      await cityHallRepository.delete(cityHall.id)
    }
  })

  it('should be able to delete a city hall', async () => {
    const defaultCityHall = await cityHallRepository.findByEmail(
      CREATE_CITY_HALL_DATA.email
    )
    const soft = false
    const result = await deleteCityHallService.execute(defaultCityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getCityHalls = await cityHallRepository.findAll({ page: 1, perPage: 100 })
    expect(getCityHalls.data.length).toBe(0)
  })

  it('should be able to soft delete a city hall', async () => {
    const defaultCityHall = await cityHallRepository.findByEmail(
      CREATE_CITY_HALL_DATA.email
    )
    const soft = true
    const result = await deleteCityHallService.execute(defaultCityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getCityHalls = await cityHallRepository.findAll({ page: 1, perPage: 100 })
    expect(getCityHalls.data.length).toBe(0)

    const getDeletedCityHalls = await cityHallRepository.findAllDeleted({
      page: 1,
      perPage: 100,
    })
    expect(getDeletedCityHalls.data.length).toBe(1)
    expect(getDeletedCityHalls.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...CREATE_CITY_HALL_DATA,
          deleted_at: expect.any(Date),
        }),
      ])
    )
  })

  it('should not be able to delete a non-existent city hall', async () => {
    const soft = false
    const result = await deleteCityHallService.execute(
      'non-existent-city-hall-id',
      soft
    )

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })
})
