import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getCityHallId } from 'src/features/city-hall/use-cases/test-helper'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { CREATE_SUB_CITY_HALL_DATA, SUB_CITY_HALLS_URL } from '../test-helper'

describe('Show sub city hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  let city_hall_id: string

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    authorization = await getUserAuthorization(api)
    city_hall_id = await getCityHallId(api)

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
