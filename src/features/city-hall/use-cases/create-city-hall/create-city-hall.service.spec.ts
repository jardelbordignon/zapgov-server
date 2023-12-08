import { CreateCityHallData } from 'src/contracts/city-halls'

import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { createCityHallData } from '../constants'
//import { CityHallAlreadyExistsError } from '../errors'

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
    const title = 'Ayuntamiento de Acapulco'

    const data: CreateCityHallData = {
      bg_image: createCityHallData.bg_image,
      email,
      name: title,
      phone: '01 (744) 440 7000',
      slug: 'acapulco',
      title,
      txt_color: createCityHallData.txt_color,
    }

    const result = await service.execute(data)
    expect(result.isSuccess()).toBe(true)
    const registeredCityHall = await repository.findByEmail(email)
    expect(registeredCityHall).toEqual(
      expect.objectContaining({
        created_at: expect.any(Date),
        deleted_at: null,
        email,
        id: expect.any(String),
        name: title,
        phone: '01 (744) 440 7000',
        slug: 'acapulco',
        title,
        updated_at: expect.any(Date),
      })
    )
  })

  // it('should be able to create a new admin user', async () => {
  //   const email = 'joesmith@email.com'
  //   const name = 'Joe Smith'

  //   const result = await service.execute({
  //     email,
  //     name,
  //     password,
  //     roles: ['ADMIN'],
  //   })
  //   expect(result.isSuccess()).toBe(true)
  //   const registeredCityHall = await repository.findByEmail(email)
  //   expect(registeredCityHall).toEqual(
  //     expect.objectContaining({ name: 'Joe Smith', roles: ['ADMIN'] })
  //   )
  // })

  // it('should not be able to create a new user with an email already in use', async () => {
  //   const result = await service.execute({ email, name: 'John', password })
  //   expect(result.isFailure()).toBe(true)
  //   expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
  // })
})
