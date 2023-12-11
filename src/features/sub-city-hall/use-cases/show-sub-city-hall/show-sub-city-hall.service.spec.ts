import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/use-cases/constants'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../constants'
import { SubCityHallNotFoundError } from '../errors'

import { ShowSubCityHallService } from './show-sub-city-hall.service'

let cityHallRepository: InMemoryCityHallRepository

let subCityHallRepository: InMemorySubCityHallRepository
let showSubCityHallService: ShowSubCityHallService

describe('Show sub city hall', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    showSubCityHallService = new ShowSubCityHallService(subCityHallRepository)

    await subCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)

    await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    const cityHall = await cityHallRepository.findByEmail(CREATE_CITY_HALL_DATA.email)

    await subCityHallRepository.create({
      ...CREATE_SUB_CITY_HALL_DATA,
      city_hall_id: cityHall.id,
    })
  })

  it('should be able to show a sub city hall', async () => {
    const { id } = await subCityHallRepository.findByEmail(
      CREATE_SUB_CITY_HALL_DATA.email
    )
    const result = await showSubCityHallService.execute(id)
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
