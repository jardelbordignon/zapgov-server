import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../test-helper'

describe('Create city-hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    authorization = await getUserAuthorization(api)
  })

  test(`[POST] ${CITY_HALLS_URL} - success`, async () => {
    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${CITY_HALLS_URL} - failure (same e-mail)`, async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)

    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        slug: 'slug-not-in-use',
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })

  test(`[POST] ${CITY_HALLS_URL} - failure (same slug)`, async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)

    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        email: 'email-not-in-use@email.com',
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.slug} slug already exists.`,
      statusCode: 409,
    })
  })
})
