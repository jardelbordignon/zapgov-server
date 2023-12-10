import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import {
  CITY_HALLS_URL,
  CREATE_CITY_HALL_DATA,
} from 'src/features/city-hall/use-cases/constants'
import { AUTH_URL, USERS_URL } from 'src/features/user/use-cases/constants'

import { CREATE_SUB_CITY_HALL_DATA, SUB_CITY_HALLS_URL } from '../constants'

describe('Create city-hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  let city_hall_id: string

  const registerAndAuthenticateUser = async () => {
    const email = 'johndoe@email.com'
    const name = 'John Doe'
    const password = 'Pwd@123'
    const data = { email, name, password }
    await api.post(USERS_URL).send(data)
    const authRes = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${authRes.body.accessToken}`
  }

  const createACityHallAndGetTheId = async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)

    const getCityHalls = await api
      .get(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send()

    city_hall_id = getCityHalls.body.data[0].id
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    await registerAndAuthenticateUser()
    await createACityHallAndGetTheId()
  })

  test(`[POST] ${SUB_CITY_HALLS_URL} - success`, async () => {
    const response = await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${SUB_CITY_HALLS_URL} - failure [non-existent city hall]`, async () => {
    const response = await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_SUB_CITY_HALL_DATA)
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'City hall not found.',
      statusCode: 404,
    })
  })

  test(`[POST] ${SUB_CITY_HALLS_URL} - failure [sub city hall with same email]`, async () => {
    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })

    const response = await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Sub city hall with ${CREATE_SUB_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })
})
