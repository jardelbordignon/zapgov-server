import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { InMemoryWaAccountRepository } from 'src/features/wa-account/repositories/in-memory.wa-account.repository'
import { CREATE_WA_ACCOUNT_DATA } from 'src/features/wa-account/shared/test-helper'

import { InMemoryContactRepository } from '../../repositories/in-memory.contact.repository'

import { ListContactsService } from './list-contacts.service'

let cityHallRepository: InMemoryCityHallRepository
let waAccountRepository: InMemoryWaAccountRepository
let contactRepository: InMemoryContactRepository
let service: ListContactsService
let wa_account_id: string

const contactNames = ['John', 'Joe', 'James']

describe('List contacts', () => {
  beforeAll(async () => {
    cityHallRepository = new InMemoryCityHallRepository()
    waAccountRepository = new InMemoryWaAccountRepository()
    contactRepository = new InMemoryContactRepository()
    service = new ListContactsService(contactRepository)

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)

    const waAccount = await waAccountRepository.create({
      ...CREATE_WA_ACCOUNT_DATA,
      city_hall_id: cityHall.id,
    })

    wa_account_id = waAccount.id

    for (const [index, value] of contactNames.entries()) {
      await contactRepository.create({
        gender: index % 2 == 0 ? 'Male' : 'Female',
        name: value,
        phone: `51 99543210${index}`,
        wa_account_id,
      })
    }
  })

  it('should be able to list the contacts', async () => {
    const result = await service.execute()

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(contactNames.length)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John' }),
        expect.objectContaining({ name: 'Joe' }),
        expect.objectContaining({ name: 'James' }),
      ])
    )
  })

  it('should be able to list the filtered contacts', async () => {
    const result = await service.execute({ filter: 'name=jo' })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(2)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John' }),
        expect.objectContaining({ name: 'Joe' }),
        //expect.objectContaining({ name: 'James' }),
      ])
    )
  })
})
