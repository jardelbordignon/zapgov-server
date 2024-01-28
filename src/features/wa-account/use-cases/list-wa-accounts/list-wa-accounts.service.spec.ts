import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'

import { InMemoryWaAccountRepository } from '../../repositories/in-memory.wa-account.repository'

import { ListWaAccountsService } from './list-wa-accounts.service'

let cityHallRepository: InMemoryCityHallRepository
let waAccountRepository: InMemoryWaAccountRepository
let service: ListWaAccountsService
let city_hall_id: string

const itemNames = ['AB1', 'CD2', 'EF3']

describe('List city-halls', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    waAccountRepository = new InMemoryWaAccountRepository()
    service = new ListWaAccountsService(waAccountRepository)

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id

    for (const [index, value] of itemNames.entries()) {
      await waAccountRepository.create({
        acronym: value,
        city_hall_id,
        phone: `54 99999999${index}`,
      })
    }
  })

  it('should be able to list the whatsapp accounts', async () => {
    const result = await service.execute()

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(itemNames.length)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ acronym: 'AB1' }),
        expect.objectContaining({ acronym: 'CD2' }),
        expect.objectContaining({ acronym: 'EF3' }),
      ])
    )
  })

  it('should be able to list the filtered whatsapp accounts', async () => {
    const result = await service.execute({ filter: 'acronym:a' })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(1)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ acronym: 'AB1' })])
    )
  })

  it('should be able to list the filtered whatsapp accounts by city_hall_id', async () => {
    const newCityHall = await cityHallRepository.create({
      email: 'newCityHall@email.com',
      name: 'New CityHall',
      phone: '51 998887766',
      slug: 'new-city-hall',
      txt_color: '#ffffff',
    })

    await waAccountRepository.create({
      acronym: 'GH4',
      city_hall_id: newCityHall.id,
      phone: '54 999999991',
    })

    const result = await service.execute({ filter: `city_hall_id:${city_hall_id}` })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(3)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ acronym: 'AB1' }),
        expect.objectContaining({ acronym: 'CD2' }),
        expect.objectContaining({ acronym: 'EF3' }),
        //expect.objectContaining({ acronym: 'GH4' }),
      ])
    )
  })
})
