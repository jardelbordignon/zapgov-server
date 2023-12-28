import { Readable } from 'stream'

import { CreateCityHallData } from 'src/contracts/city-halls'
import { FakeFileStorage } from 'src/infra/providers/file-storage/fake-file-storage'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from '../../shared/test-helper'
import { CityHallAlreadyExistsError } from '../errors'

import { CreateCityHallService } from './create-city-hall.service'

let mockFile: Express.Multer.File
let repository: InMemoryCityHallRepository
let fileStorage: FakeFileStorage
let i18n: I18n
let service: CreateCityHallService

describe('Create city hall', () => {
  beforeAll(async () => {
    repository = new InMemoryCityHallRepository()
    fileStorage = new FakeFileStorage()
    i18n = new I18n()
    service = new CreateCityHallService(repository, fileStorage, i18n)
    mockFile = {
      buffer: Buffer.from('test'),
      destination: './uploads/',
      encoding: '7bit',
      fieldname: 'test',
      filename: 'test.jpg',
      mimetype: 'image/jpeg',
      originalname: 'test.jpg',
      path: '/uploads/test.jpg',
      size: 100,
      stream: new Readable(),
    }
  })

  beforeEach(async () => {
    await repository.create(CREATE_CITY_HALL_DATA)
  })

  afterEach(async () => {})

  it('should be able to register a new city hall', async () => {
    const email = 'acapulco.ayuntamiento@email.com'
    const name = 'Ayuntamiento de Acapulco'
    const txt_color = '#DDDDDD'

    const data: CreateCityHallData = {
      email,
      name,
      phone: '01 (744) 440 7000',
      slug: 'acapulco',
      txt_color,
    }

    const result = await service.execute(data, mockFile)
    expect(result.isSuccess()).toBe(true)
    const registeredCityHall = await repository.findByEmail(email)
    expect(registeredCityHall).toEqual({
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
    const result = await service.execute(
      {
        ...CREATE_CITY_HALL_DATA,
        slug: 'valid-new-slug',
      },
      mockFile
    )
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
    // expect(result.value).toEqual(
    //   `[Error: City hall with ${CREATE_CITY_HALL_DATA.email} email address already exists.]`
    // )
  })

  it('should not be able to register a new city hall with a slug already in use', async () => {
    const result = await service.execute(
      {
        ...CREATE_CITY_HALL_DATA,
        email: 'valid-new-email@example.com',
      },
      mockFile
    )
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
  })
})
