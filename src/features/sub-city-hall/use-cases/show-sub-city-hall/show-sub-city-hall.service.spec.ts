import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../../shared/test-helper'
import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { SubCityHallNotFoundError } from '../errors'

import { ShowSubCityHallService } from './show-sub-city-hall.service'

let cityHallRepository: InMemoryCityHallRepository

let subCityHallRepository: InMemorySubCityHallRepository
let i18n: I18n
let showSubCityHallService: ShowSubCityHallService
let subCityHall: SubCityHallEntity

describe('Show sub city hall', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    i18n = new I18n()
    showSubCityHallService = new ShowSubCityHallService(subCityHallRepository, i18n)

    subCityHall = await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)

    await subCityHallRepository.create({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id: cityHall.id,
    })
  })

  it('should be able to show a sub city hall', async () => {
    const result = await showSubCityHallService.execute(subCityHall.id)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        ...CREATE_SUB_CITY_HALL_DATA,
        id: expect.any(String),
      })
    )
  })

  it('should not be able to show a nonexistent sub city hall', async () => {
    const result = await showSubCityHallService.execute('invalid-sub-city-hall-id')
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(SubCityHallNotFoundError)
  })
})
