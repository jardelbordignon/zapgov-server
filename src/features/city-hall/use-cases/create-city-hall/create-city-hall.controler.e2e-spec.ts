import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData } from 'src/contracts/account'
import { AUTH_URL, USERS_URL } from 'src/features/user/use-cases/constants'

import { CITY_HALLS_URL, createCityHallData } from '../constants'

describe('Create city-hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'

  const registerUser = async (data: CreateUserData) => {
    await api.post(USERS_URL).send(data)
  }

  const authenticate = async (data: AuthUserData) => {
    const authRes = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${authRes.body.accessToken}`
  }

  // const getCityHalls = async () => {
  //   const response = await api
  //     .get(CITY_HALLS_URL)
  //     .set('Authorization', authorization)
  //     .send()
  //   return response.body.data
  // }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    await registerUser({ email, name, password })
    await authenticate({ email, password })
  })

  // afterEach(async () => {
  //   const cityHalls = await getCityHalls()
  //   console.log('cityHalls: ', cityHalls)
  // })

  test(`[POST] ${CITY_HALLS_URL} - success`, async () => {
    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(createCityHallData)
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${CITY_HALLS_URL} - failure (same e-mail)`, async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(createCityHallData)

    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...createCityHallData,
        slug: 'slug-not-in-use',
      })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: `CityHall with ${createCityHallData.email} email address already exists.`,
      statusCode: 401,
    })
  })

  test(`[POST] ${CITY_HALLS_URL} - failure (same slug)`, async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(createCityHallData)

    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...createCityHallData,
        email: 'email-not-in-use@email.com',
      })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: `CityHall with ${createCityHallData.slug} slug already exists.`,
      statusCode: 401,
    })
  })
})
