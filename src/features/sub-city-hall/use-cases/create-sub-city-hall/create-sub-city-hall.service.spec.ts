import { CreateSubCityHallData } from 'src/contracts/sub-city-halls'
import { CityHallEntity } from 'src/features/city-hall/city-hall.entity'
import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../../shared/test-helper'
import { SubCityHallAlreadyExistsError } from '../errors'

import { CreateSubCityHallService } from './create-sub-city-hall.service'

let cityHallRepository: InMemoryCityHallRepository
let cityHall: CityHallEntity

let subCityHallRepository: InMemorySubCityHallRepository
let i18n: I18n
let service: CreateSubCityHallService

describe('Create sub city hall', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    i18n = new I18n()
    service = new CreateSubCityHallService(
      subCityHallRepository,
      cityHallRepository,
      i18n
    )

    cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
  })

  beforeEach(async () => {
    await subCityHallRepository.create({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id: cityHall.id,
    })
  })

  afterEach(async () => {
    const getAll = await subCityHallRepository.findAll()
    for (const item of getAll.data) {
      await subCityHallRepository.delete(item.id)
    }
  })

  it('should be able to register a new sub city hall', async () => {
    const newSubCityHalData: CreateSubCityHallData = {
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id: cityHall.id,
      email: 'sub-city-hall-b@email.com',
      name: 'Sub City Hall B',
    }

    const result = await service.execute(newSubCityHalData)
    expect(result.isSuccess()).toBe(true)
  })
  it('should not be able to register a new sub city hall with a non-existent city hall', async () => {
    const newSubCityHalData: CreateSubCityHallData = {
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id: 'non-existent-city-hall-id',
      email: 'sub-city-hall-b@email.com',
      name: 'Sub City Hall B',
    }

    const result = await service.execute(newSubCityHalData)
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })

  it('should not be able to register a new sub city hall with an email already in use', async () => {
    const result = await service.execute({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id: cityHall.id,
      name: 'Sub City Hall B',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(SubCityHallAlreadyExistsError)
  })
})
