import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData, UpdateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

describe('Update user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let accessToken: string
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

    const createUserData: CreateUserData = {
      email,
      name,
      password,
    }

    await api.post(USERS_URL).send(createUserData)

    const authUserData: AuthUserData = { email, password }
    const authRes = await api.post('/auth').send(authUserData)
    accessToken = authRes.body.accessToken
  })

  test(`[PUT] ${USERS_URL} - success`, async () => {
    const updateUserData: UpdateUserData = {
      name: 'updated name',
    }

    const response = await api
      .put(USERS_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateUserData)

    expect(response.statusCode).toBe(200)
  })
})
