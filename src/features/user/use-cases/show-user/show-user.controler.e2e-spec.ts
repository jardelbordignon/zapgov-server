import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

describe('Show user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  const email = 'johndoe@email.com'
  const name = 'John Doe'

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
      password: 'Pwd@123',
    }

    await api.post(USERS_URL).send(createUserData)
  })

  test(`[GET] ${USERS_URL} - success`, async () => {
    const getUsers = await api.get(USERS_URL).send()

    const userId = getUsers.body[0].id

    const getUser = await api.get(`${USERS_URL}/${userId}`).send()

    expect(getUser.statusCode).toBe(200)
    expect(getUser.body).toEqual(expect.objectContaining({ email, name }))
  })

  test(`[GET] ${USERS_URL}/:id - failure`, async () => {
    const getUser = await api.get(`${USERS_URL}/invalid-user-id`).send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'User not found.',
        statusCode: 404,
      })
    )
  })
})
