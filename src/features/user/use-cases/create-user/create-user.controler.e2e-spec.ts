import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import type { AuthUserData, CreateUserData } from 'src/contracts/account'

import { AUTH_URL, USERS_URL } from '../constants'

describe('Create user (E2E)', () => {
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
  })

  test(`[POST] ${USERS_URL} - success`, async () => {
    const createUserData: CreateUserData = { email, name, password }
    const response = await api.post(USERS_URL).send(createUserData)
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${USERS_URL} - success (role ADMIN)`, async () => {
    const adminEmail = 'admin@email.com'
    const createUserData: CreateUserData = {
      email: adminEmail,
      name,
      password,
      roles: ['ADMIN'],
    }
    const response = await api.post(USERS_URL).send(createUserData)
    expect(response.statusCode).toBe(201)
    const authUserData: AuthUserData = { email: adminEmail, password }
    const authRes = await api.post(AUTH_URL).send(authUserData)
    const getUsers = await api
      .get(USERS_URL)
      .set('Authorization', `Bearer ${authRes.body.accessToken}`)
      .send()
    expect(getUsers.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name, roles: ['ADMIN'] })])
    )
  })

  test(`[POST] ${USERS_URL} - failure (same e-mail)`, async () => {
    const createUserData: CreateUserData = { email, name, password }
    await api.post(USERS_URL).send(createUserData)
    const response = await api.post(USERS_URL).send(createUserData)
    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: `User with ${email} email address already exists.`,
      statusCode: 401,
    })
  })
})
