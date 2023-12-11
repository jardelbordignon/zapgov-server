import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/use-cases/test-helper'
import { slugify } from 'src/infra/utils/text-formatters'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../test-helper'

import { ListSubCityHallsService } from './list-sub-city-halls.service'

let cityHallRepository: InMemoryCityHallRepository
let city_hall_id: string

let subCityHallRepository: InMemorySubCityHallRepository
let service: ListSubCityHallsService

const subCityHallNames = ['SCH A', 'SCH B', 'SCH C']

describe('List sub-city-halls', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    subCityHallRepository = new InMemorySubCityHallRepository()
    service = new ListSubCityHallsService(subCityHallRepository)

    await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    const cityHall = await cityHallRepository.findByEmail(CREATE_CITY_HALL_DATA.email)
    city_hall_id = cityHall.id

    for (const name of subCityHallNames) {
      await subCityHallRepository.create({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
        email: `${slugify(name)}@email.com`,
        name,
      })
    }
  })

  it('should be able to list the sub-city-halls', async () => {
    const result = await service.execute({ page: 1, perPage: 10 })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(subCityHallNames.length)
    expect(result.value).toEqual({
      data: expect.arrayContaining([
        expect.objectContaining({
          city_hall_id,
          email: `sch-a@email.com`,
          name: 'SCH A',
        }),
        expect.objectContaining({ name: 'SCH B' }),
        expect.objectContaining({ name: 'SCH C' }),
      ]),
      meta: {
        hasNext: false,
        hasPrevious: false,
        page: 1,
        perPage: 10,
        totalItems: 3,
        totalPages: 1,
      },
    })
  })

  it('should be able to list the searched sub-city-halls', async () => {
    const result = await service.execute({
      page: 1,
      perPage: 10,
      searchTerm: 'b',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value.data.length).toBe(1)
    expect(result.value.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'SCH B' })])
    )
  })
})
