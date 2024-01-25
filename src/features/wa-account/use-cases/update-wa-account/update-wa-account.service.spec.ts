import { randomUUID } from 'crypto'

import { InMemoryCityHallRepository } from 'src/features/city-hall/repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from 'src/features/city-hall/shared/test-helper'
import { CityHallNotFoundError } from 'src/features/city-hall/use-cases/errors'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryWaAccountRepository } from '../../repositories/in-memory.wa-account.repository'
import { CREATE_WA_ACCOUNT_DATA } from '../../shared/test-helper'
import { WaAccountEntity } from '../../wa-account.entity'
import { WaAccountAlreadyExistsError } from '../errors'

import { UpdateWaAccountService } from './update-wa-account.service'

let waAccountRepository: InMemoryWaAccountRepository
let cityHallRepository: InMemoryCityHallRepository
let i18n: I18n
let service: UpdateWaAccountService
let waAccount: WaAccountEntity
let city_hall_id: string

describe('Update whatsapp account', () => {
  beforeAll(async () => {
    waAccountRepository = new InMemoryWaAccountRepository()
    cityHallRepository = new InMemoryCityHallRepository()
    i18n = new I18n()

    service = new UpdateWaAccountService(
      waAccountRepository,
      cityHallRepository,
      i18n
    )

    const cityHall = await cityHallRepository.create(CREATE_CITY_HALL_DATA)
    city_hall_id = cityHall.id
  })

  beforeEach(async () => {
    waAccount = await waAccountRepository.create({
      ...CREATE_WA_ACCOUNT_DATA,
      city_hall_id,
    })
  })

  afterEach(async () => {
    const getItems = await cityHallRepository.findAll()
    for (const item of getItems.data) {
      await cityHallRepository.delete(item.id)
    }
  })

  it('should be able to update a whatsapp account', async () => {
    const result = await service.execute(waAccount.id, { acronym: 'ABC1' })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(expect.objectContaining({ acronym: 'ABC1' }))
  })

  it('should not be able to update a whatsapp account with a invalid city_hall_id', async () => {
    const result = await service.execute(waAccount.id, { city_hall_id: randomUUID() })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })

  it('should not be able to update a whatsapp account with an acronym already in use', async () => {
    await waAccountRepository.create({
      acronym: 'ABC1',
      city_hall_id,
      phone: '5199999999',
    })

    const result = await service.execute(waAccount.id, { acronym: 'ABC1' })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WaAccountAlreadyExistsError)
  })

  it('should not be able to update a whatsapp account with a phone number already in use', async () => {
    await waAccountRepository.create({
      acronym: 'ABC1',
      city_hall_id,
      phone: '5199999999',
    })

    const result = await service.execute(waAccount.id, { phone: '5199999999' })

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WaAccountAlreadyExistsError)
  })
})
