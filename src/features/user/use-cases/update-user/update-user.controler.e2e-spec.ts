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
    const updatedName = `Updated ${name}`
    const updateUserData: UpdateUserData = { name: updatedName }

    const response = await api
      .put(USERS_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateUserData)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test(`[PUT] ${USERS_URL} - success (credentials)`, async () => {
    const updatedEmail = `updated-${email}`
    const updatedPassword = `updated-${password}`
    const updateUserData: UpdateUserData = {
      currentPassword: password,
      email: updatedEmail,
      password: updatedPassword,
    }

    const response = await api
      .put(USERS_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateUserData)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ email: updatedEmail }))
  })

  test(`[PUT] ${USERS_URL} - failure (credentials without current password)`, async () => {
    const updateUserData: UpdateUserData = { email: 'new-address@email.com' }

    const response = await api
      .put(USERS_URL)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateUserData)

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Property currentPassword is required to change email or password.',
      statusCode: 401,
    })
  })
})
