import { CityHall } from '@prisma/client'

import { FakeFileStorage } from 'src/infra/providers/file-storage/fake-file-storage'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { CityHallRepository } from '../../repositories/city-hall.repository'
import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from '../../shared/test-helper'
import { CityHallNotFoundError } from '../errors'

import { DeleteCityHallService } from './delete-city-hall.service'

let cityHall: CityHall
let cityHallRepository: CityHallRepository
let fileStorage: FakeFileStorage
let i18n: I18n
let deleteCityHallService: DeleteCityHallService

describe('Delete city hall', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    fileStorage = new FakeFileStorage()
    i18n = new I18n()
    deleteCityHallService = new DeleteCityHallService(
      cityHallRepository,
      fileStorage,
      i18n
    )
  })

  beforeEach(async () => {
    cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
  })

  afterEach(async () => {
    const getCityHalls = await cityHallRepository.findAll({ page: 1, perPage: 100 })
    for (const cityHall of getCityHalls.data) {
      await cityHallRepository.delete(cityHall.id)
    }
  })

  it('should be able to delete a city hall', async () => {
    const soft = false
    const result = await deleteCityHallService.execute(cityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getCityHalls = await cityHallRepository.findAll({ page: 1, perPage: 100 })
    expect(getCityHalls.data.length).toBe(0)
  })

  it('should be able to soft delete a city hall', async () => {
    const soft = true
    const result = await deleteCityHallService.execute(cityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getCityHalls = await cityHallRepository.findAll({ page: 1, perPage: 100 })
    expect(getCityHalls.data.length).toBe(0)

    const getDeletedCityHalls = await cityHallRepository.findAll({
      deleted: true,
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
