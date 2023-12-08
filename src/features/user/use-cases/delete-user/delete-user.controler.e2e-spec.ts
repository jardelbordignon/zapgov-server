import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import type { AuthUserData, CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

describe('Delete user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  const johnEmail = 'johndoe@email.com'
  const joeEmail = 'joesmith@email.com'
  const password = 'Pwd@123'

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    const createJohnData: CreateUserData = {
      email: johnEmail,
      name: 'John Doe',
      password,
    }
    await api.post(USERS_URL).send(createJohnData)

    const createJoeData: CreateUserData = {
      email: joeEmail,
      name: 'Joe Smith',
      password,
    }
    await api.post(USERS_URL).send(createJoeData)

    const johnCredentials: AuthUserData = { email: johnEmail, password }
    const authRes = await api.post('/auth').send(johnCredentials)
    authorization = `Bearer ${authRes.body.accessToken}`
  })

  test(`[DELETE] ${USERS_URL} - success`, async () => {
    const getUsers = await api
      .get(USERS_URL)
      .set('Authorization', authorization)
      .send()

    const joe = getUsers.body.data.find(user => user.email === joeEmail)

    const response = await api
      .delete(`${USERS_URL}/${joe.id}`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)
  })
})
