import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData } from 'src/contracts/account'
import { AUTH_URL, USERS_URL } from 'src/features/user/use-cases/constants'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../constants'

describe('Update user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string

  const register = async (data: CreateUserData) => {
    await api.post(USERS_URL).send(data)
  }

  const authenticate = async (data: AuthUserData) => {
    const authRes = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${authRes.body.accessToken}`
  }

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

    const email = 'johndoe@email.com'
    const name = 'John Doe'
    const password = 'Pwd@123'
    await register({ email, name, password })
    await authenticate({ email, password })

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

  test(`[PUT] ${USERS_URL} - success`, async () => {
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

  test(`[PUT] ${USERS_URL} - failure (same email)`, async () => {
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
      message: `CityHall with ${CREATE_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })

  test(`[PUT] ${USERS_URL} - failure (same slug)`, async () => {
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
      message: `CityHall with ${CREATE_CITY_HALL_DATA.slug} slug already exists.`,
      statusCode: 409,
    })
  })
})
