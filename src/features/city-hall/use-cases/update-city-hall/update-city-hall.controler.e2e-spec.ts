import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../test-helper'

describe('Update user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string

  const getAll = async () => {
    const response = await api
      .get(`${CITY_HALLS_URL}?page=1&perPage=1000`)
      .set('Authorization', authorization)
      .send()
    return response.body.data
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    authorization = await getUserAuthorization(api)

    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)
  })

  // beforeEach(async () => {
  //   await api
  //     .post(CITY_HALLS_URL)
  //     .set('Authorization', authorization)
  //     .send(CREATE_CITY_HALL_DATA)
  // })

  // afterEach(async () => {
  //   const items = await getAll()
  //   for (const item of items) {
  //     await api
  //       .delete(`${CITY_HALLS_URL}/${item.id}`)
  //       .set('Authorization', authorization)
  //       .send()
  //   }
  // })

  test(`[PUT] ${CITY_HALLS_URL} - success`, async () => {
    const items = await getAll()
    const item = items.find(item => item.email === CREATE_CITY_HALL_DATA.email)

    const updatedName = `Updated ${CREATE_CITY_HALL_DATA.name}`
    const response = await api
      .put(`${CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send({ name: updatedName })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test(`[PUT] ${CITY_HALLS_URL} - failure (same email)`, async () => {
    const cancunEmail = 'cancun@email.com'
    const cancunSlug = 'cancun'
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        email: cancunEmail,
        name: 'Cancun',
        slug: cancunSlug,
      })

    const items = await getAll()
    const item = items.find(item => item.email === cancunEmail)

    const response = await api
      .put(`${CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send({ email: CREATE_CITY_HALL_DATA.email })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })

  test(`[PUT] ${CITY_HALLS_URL} - failure (same slug)`, async () => {
    const cancunEmail = 'cancun@email.com'
    const cancunSlug = 'cancun'
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        email: cancunEmail,
        name: 'Cancun',
        slug: cancunSlug,
      })

    const items = await getAll()
    const item = items.find(item => item.email === cancunEmail)

    const response = await api
      .put(`${CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send({ slug: CREATE_CITY_HALL_DATA.slug })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.slug} slug already exists.`,
      statusCode: 409,
    })
  })
})
