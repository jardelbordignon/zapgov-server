import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import type { AuthUserData, CreateUserData } from 'src/contracts/account'

import { AUTH_URL, USERS_URL } from '../constants'

describe('Auth user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    const createUserData: CreateUserData = { email, name, password }

    await api.post(USERS_URL).send(createUserData)
  })

  test(`[POST] ${AUTH_URL} - success`, async () => {
    const authUserData: AuthUserData = { email, password }
    const authRes = await api.post(AUTH_URL).send(authUserData)

    expect(authRes.statusCode).toBe(200)
    expect(authRes.body).toEqual({
      accessToken: expect.any(String),
      isAdmin: expect.any(Boolean),
    })
  })

  test(`[POST] ${AUTH_URL} - failure (invalid credentials)`, async () => {
    const authUserData: AuthUserData = { email, password: 'wrong' }
    const authRes = await api.post(AUTH_URL).send(authUserData)

    expect(authRes.statusCode).toBe(401)
    expect(authRes.body).toEqual({
      error: 'Unauthorized',
      message: 'Credentials are not valid.',
      statusCode: 401,
    })
  })
})
