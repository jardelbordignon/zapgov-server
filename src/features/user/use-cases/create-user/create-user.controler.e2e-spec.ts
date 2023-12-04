import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import type { CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

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
