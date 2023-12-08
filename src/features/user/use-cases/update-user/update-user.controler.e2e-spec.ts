import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData, UpdateUserData } from 'src/contracts/account'

import { AUTH_URL, USERS_URL } from '../constants'

describe('Update user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  const adminEmail = 'admin@email.com'
  const adminName = 'Admin User'
  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'

  const register = async (data: CreateUserData) => {
    await api.post(USERS_URL).send(data)
  }

  const authenticate = async (data: AuthUserData) => {
    const authRes = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${authRes.body.accessToken}`
  }

  const update = async (data: UpdateUserData) => {
    return api.put(USERS_URL).set('Authorization', authorization).send(data)
  }

  const getUsers = async () => {
    const response = await api
      .get(USERS_URL)
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
  })

  beforeEach(async () => {
    await register({ email: adminEmail, name: adminName, password, roles: ['ADMIN'] })
    await register({ email, name, password })
    await authenticate({ email, password })
  })

  afterEach(async () => {
    await authenticate({ email: adminEmail, password })
    const users = await getUsers()
    for (const user of users) {
      await api
        .delete(`${USERS_URL}/${user.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[PUT] ${USERS_URL} - success`, async () => {
    const updatedName = `Updated ${name}`
    const response = await update({ name: updatedName })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test(`[PUT] ${USERS_URL} - success (credentials)`, async () => {
    const updatedEmail = `updated-${email}`
    const updatedPassword = `updated-${password}`

    const response = await update({
      currentPassword: password,
      email: updatedEmail,
      password: updatedPassword,
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ email: updatedEmail }))
  })

  test(`[PUT] ${USERS_URL} - failure (credentials without current password)`, async () => {
    const updateUserData: UpdateUserData = { email: 'new-address@email.com' }

    const response = await api
      .put(USERS_URL)
      .set('Authorization', authorization)
      .send(updateUserData)

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Property currentPassword is required to change email or password.',
      statusCode: 401,
    })
  })

  test(`[PUT] ${USERS_URL}/:userId - success (ADMIN)`, async () => {
    await authenticate({ email: adminEmail, password })

    const users = await getUsers()

    const john = users.find(user => user.email === email)

    const updatedName = `Updated ${john.name}`
    const updateUserData: UpdateUserData = { name: updatedName }

    const response = await api
      .put(`${USERS_URL}/${john.id}`)
      .set('Authorization', authorization)
      .send(updateUserData)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test(`[PUT] ${USERS_URL}/:userId - success - credentials (ADMIN)`, async () => {
    await authenticate({ email: adminEmail, password })

    const users = await getUsers()

    const john = users.find(user => user.email === email)

    const updatedEmail = `updated-${john.email}`
    const updateUserData: UpdateUserData = { email: updatedEmail }

    const response = await api
      .put(`${USERS_URL}/${john.id}`)
      .set('Authorization', authorization)
      .send(updateUserData)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ email: updatedEmail }))
  })
})
