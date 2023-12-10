import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AUTH_URL, USERS_URL } from 'src/features/user/use-cases/constants'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../constants'

describe('Show city hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string

  const registerAndAuthenticateUser = async () => {
    const email = 'johndoe@email.com'
    const name = 'John Doe'
    const password = 'Pwd@123'
    const data = { email, name, password }
    await api.post(USERS_URL).send(data)
    const response = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${response.body.accessToken}`
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    await registerAndAuthenticateUser()

    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)
  })

  test(`[GET] ${CITY_HALLS_URL} - success`, async () => {
    const getItems = await api
      .get(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send()

    const item = getItems.body.data.find(
      item => item.email === CREATE_CITY_HALL_DATA.email
    )

    const getItem = await api
      .get(`${CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send()

    expect(getItem.statusCode).toBe(200)
    expect(getItem.body).toEqual(
      expect.objectContaining({ ...CREATE_CITY_HALL_DATA, id: expect.any(String) })
    )
  })

  test(`[GET] ${CITY_HALLS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${CITY_HALLS_URL}/invalid-user-id`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'City hall not found.',
        statusCode: 404,
      })
    )
  })
})
