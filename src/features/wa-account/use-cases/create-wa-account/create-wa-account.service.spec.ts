import { randomUUID } from 'crypto'

import { CreateWaAccountData } from 'src/contracts/wa-account'
import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryWaAccountRepository } from '../../repositories/in-memory.wa-account.repository'
import { WaAccountAlreadyExistsError } from '../errors'

import { CreateWaAccountService } from './create-wa-account.service'

let waAccountRepository: InMemoryWaAccountRepository
let cityHallRepository: InMemoryCityHallRepository
let i18n: I18n
let service: CreateWaAccountService
let city_hall_id: string

describe('Create whatsapp account', () => {
  beforeAll(async () => {
    waAccountRepository = new InMemoryWaAccountRepository()
    cityHallRepository = new InMemoryCityHallRepository()
    i18n = new I18n()

    service = new CreateWaAccountService(
      waAccountRepository,
      cityHallRepository,
      i18n
    )

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id
  })

  it('should be able to register a new whatsapp account', async () => {
    const data: CreateWaAccountData = {
      acronym: 'ABC1',
      city_hall_id,
      phone: '5199999999',
    }

    const result = await service.execute(data)
    expect(result.isSuccess()).toBe(true)
  })

  it('should not be able to update a whatsapp account with a invalid city_hall_id', async () => {
    const data: CreateWaAccountData = {
      acronym: 'ABC1',
      city_hall_id: randomUUID(),
      phone: '5199999999',
    }

    const result = await service.execute(data)

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })

  it('should not be able to register a new whatsapp account with an acronym already in use', async () => {
    await service.execute({
      acronym: 'ABC1',
      city_hall_id,
      phone: '5199999999',
    })

    const result = await service.execute({
      acronym: 'ABC1',
      city_hall_id,
      phone: '5199999998',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WaAccountAlreadyExistsError)
  })

  it('should not be able to register a new whatsapp account with a phone number already in use', async () => {
    await service.execute({
      acronym: 'ABC1',
      city_hall_id,
      phone: '5199999999',
    })

    const result = await service.execute({
      acronym: 'ABC2',
      city_hall_id,
      phone: '5199999999',
    })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WaAccountAlreadyExistsError)
  })
})
