import { CreateCityHallData } from 'src/contracts/city-halls'

import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { createCityHallData } from '../constants'
import { CityHallAlreadyExistsError } from '../errors'

import { CreateCityHallService } from './create-city-hall.service'

let repository: InMemoryCityHallRepository
let service: CreateCityHallService

describe('Create user', () => {
  beforeAll(async () => {
    repository = new InMemoryCityHallRepository()
    service = new CreateCityHallService(repository)
  })

  beforeEach(async () => {
    await repository.create(createCityHallData)
  })

  afterEach(async () => {})

  it('should be able to register a new city hall', async () => {
    const email = 'acapulco.ayuntamiento@email.com'
    const name = 'Ayuntamiento de Acapulco'
    const bg_image = '#eeeeee'
    const txt_color = '#DDDDDD'

    const data: CreateCityHallData = {
      bg_image,
      email,
      name,
      phone: '01 (744) 440 7000',
      slug: 'acapulco',
      txt_color,
    }

    const result = await service.execute(data)
    expect(result.isSuccess()).toBe(true)
    const registeredCityHall = await repository.findByEmail(email)
    expect(registeredCityHall).toEqual({
      bg_image,
      created_at: expect.any(Date),
      deleted_at: null,
      email,
      id: expect.any(String),
      name,
      phone: '01 (744) 440 7000',
      slug: 'acapulco',
      txt_color,
      updated_at: expect.any(Date),
    })
  })

  it('should not be able to register a new city hall with an email already in use', async () => {
    const result = await service.execute({
      ...createCityHallData,
      slug: 'valid-new-slug',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
    // expect(result.value).toEqual(
    //   `[Error: CityHall with ${createCityHallData.email} email address already exists.]`
    // )
  })

  it('should not be able to register a new city hall with a slug already in use', async () => {
    const result = await service.execute({
      ...createCityHallData,
      email: 'valid-new-email@example.com',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
  })
})
