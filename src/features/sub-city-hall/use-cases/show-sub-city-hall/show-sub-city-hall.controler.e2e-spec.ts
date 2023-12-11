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

describe('Show sub city hall (E2E)', () => {
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
    const response = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${response.body.accessToken}`
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

    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })
  })

  test(`[GET] ${SUB_CITY_HALLS_URL} - success`, async () => {
    const getItems = await api
      .get(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send()

    const item = getItems.body.data.find(
      item => item.email === CREATE_SUB_CITY_HALL_DATA.email
    )

    const getItem = await api
      .get(`${SUB_CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send()

    expect(getItem.statusCode).toBe(200)
    expect(getItem.body).toEqual(
      expect.objectContaining({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id: expect.any(String),
        id: expect.any(String),
      })
    )
  })

  test(`[GET] ${SUB_CITY_HALLS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${SUB_CITY_HALLS_URL}/invalid-sub-city-hall-id`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'Sub city hall not found.',
        statusCode: 404,
      })
    )
  })
})
