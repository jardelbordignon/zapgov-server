import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

describe('Show user (E2E)', () => {
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

    const createUserData: CreateUserData = { email, name, password }

    await api.post(USERS_URL).send(createUserData)

    const authUserData: AuthUserData = { email, password }
    const authRes = await api.post('/auth').send(authUserData)
    accessToken = authRes.body.accessToken
  })

  test(`[GET] ${USERS_URL} - success`, async () => {
    const getUsers = await api
      .get(USERS_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    const firstUserId = getUsers.body[0].id

    const getUser = await api
      .get(`${USERS_URL}/${firstUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(getUser.statusCode).toBe(200)
    expect(getUser.body).toEqual(expect.objectContaining({ email, name }))
  })

  test(`[GET] ${USERS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${USERS_URL}/invalid-user-id`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

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
