import { randomUUID } from 'node:crypto'

import { CreateContactInputData } from 'src/contracts/contacts'
import type { CreateWaAccountData } from 'src/contracts/wa-account'
import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { InMemoryWaAccountRepository } from 'src/features/wa-account/repositories/in-memory.wa-account.repository'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryContactRepository } from '../../repositories/in-memory.contact.repository'
import { CREATE_CONTACT_DATA } from '../../shared/test-helper'
import { ContactAlreadyExistsError } from '../errors'

import { CreateContactService } from './create-contact.service'

let contactRepository: InMemoryContactRepository
let cityHallRepository: InMemoryCityHallRepository
let waAccountRepository: InMemoryWaAccountRepository
let i18n: I18n
let service: CreateContactService

let city_hall_id: string
let wa_account_id: string

describe('Create contact', () => {
  beforeAll(async () => {
    contactRepository = new InMemoryContactRepository()
    cityHallRepository = new InMemoryCityHallRepository()
    waAccountRepository = new InMemoryWaAccountRepository()
    i18n = new I18n()

    service = new CreateContactService(
      contactRepository,
      cityHallRepository,
      waAccountRepository,
      i18n
    )

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id

    const data: CreateWaAccountData = {
      acronym: 'AB1',
      city_hall_id,
      phone: '54 999999999',
    }

    const waAccount = await waAccountRepository.create(data)
    wa_account_id = waAccount.id
  })

  beforeEach(async () => {
    await contactRepository.create({
      ...CREATE_CONTACT_DATA,
      wa_account_id,
    })
  })

  afterEach(async () => {
    const getAll = await contactRepository.findAll()
    for (const item of getAll.data) {
      await contactRepository.delete(item.id)
    }
  })

  it('should be able to register a new contact', async () => {
    const data: CreateContactInputData = {
      ...CREATE_CONTACT_DATA,
      city_hall_id,
      phone: '54 991234567',
    }

    const result = await service.execute(data)
    expect(result.isSuccess()).toBe(true)

    const waAccount = await waAccountRepository.findById(wa_account_id)
    expect(waAccount?.contacts_qty).toBe(1)
  })

  it('should be able to register a new contact in the next available whatsapp account', async () => {
    await waAccountRepository.update(wa_account_id, { contacts_qty: 4000 })

    const secondWaAccount = await waAccountRepository.create({
      acronym: 'AB2',
      city_hall_id,
      phone: '54 999999998',
    })

    const data: CreateContactInputData = {
      ...CREATE_CONTACT_DATA,
      city_hall_id,
      phone: '54 991234567',
    }

    const result = await service.execute(data)
    expect(result.isSuccess()).toBe(true)

    const waAccount = await waAccountRepository.findById(wa_account_id)
    expect(waAccount?.contacts_qty).toBe(4000)

    const refreshedSecondWaAccount = await waAccountRepository.findById(
      secondWaAccount.id
    )
    expect(refreshedSecondWaAccount?.contacts_qty).toBe(1)
  })

  it('should not be able to register a new contact with a non-existent city hall', async () => {
    const result = await service.execute({
      ...CREATE_CONTACT_DATA,
      city_hall_id: randomUUID(),
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })

  it('should not be able to register a new contact with same phone number', async () => {
    const data: CreateContactInputData = {
      ...CREATE_CONTACT_DATA,
      city_hall_id,
    }

    const result = await service.execute(data)
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(ContactAlreadyExistsError)
  })
})
