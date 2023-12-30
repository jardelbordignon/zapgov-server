import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'

import { InMemoryWaAccountRepository } from '../../repositories/in-memory.wa-account.repository'

import { ListWaAccountsService } from './list-wa-accounts.service'

let cityHallRepository: InMemoryCityHallRepository
let repository: InMemoryWaAccountRepository
let service: ListWaAccountsService
let city_hall_id: string

const itemNames = ['A', 'B', 'C']

describe('List city-halls', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    repository = new InMemoryWaAccountRepository()
    service = new ListWaAccountsService(repository)

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id

    for (const [index, value] of itemNames.entries()) {
      await repository.create({
        acronym: value,
        city_hall_id,
        phone: `54 99999999${index}`,
      })
    }
  })

  it('should be able to list the whatsapp accounts', async () => {
    const result = await service.execute({ page: 1, perPage: 10 })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(itemNames.length)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ acronym: 'A' }),
        expect.objectContaining({ acronym: 'B' }),
        expect.objectContaining({ acronym: 'C' }),
      ])
    )
  })

  it('should be able to list the searched whatsapp accounts', async () => {
    const result = await service.execute({
      page: 1,
      perPage: 10,
      searchTerm: 'a',
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(1)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ acronym: 'A' })])
    )
  })
})
