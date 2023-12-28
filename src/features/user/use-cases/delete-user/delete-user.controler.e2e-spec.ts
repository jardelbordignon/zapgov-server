import { Supertest, supertest } from 'test/e2e.helper'

import type { AuthUserData, CreateUserData } from 'src/contracts/account'

import {
  AUTH_URL,
  CREATE_ADMIN_USER_DATA,
  CREATE_REGULAR_USER_DATA,
  USERS_URL,
} from '../../shared/test-helper'
import { UserEntity } from '../../user.entity'

describe('Delete user (E2E)', () => {
  let api: Supertest
  let authorization: string

  const registerUser = async (data: CreateUserData) => {
    await api.post(USERS_URL).send(data)
  }

  const authenticateUser = async (data: AuthUserData) => {
    const response = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${response.body.accessToken}`
  }

  const getUsers = async (): Promise<UserEntity[]> => {
    const res = await api.get(USERS_URL).set('Authorization', authorization).send()
    return res.body.data
  }

  beforeAll(async () => {
    api = await supertest()
  })

  beforeEach(async () => {
    await registerUser(CREATE_REGULAR_USER_DATA)
    await registerUser(CREATE_ADMIN_USER_DATA)
    await authenticateUser(CREATE_ADMIN_USER_DATA)
  })

  afterEach(async () => {
    await authenticateUser(CREATE_ADMIN_USER_DATA)
    const users = await getUsers()
    for (const user of users) {
      await api
        .delete(`${USERS_URL}/${user.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[DELETE] ${USERS_URL} - success`, async () => {
    const users = await getUsers()

    const regularUser = users.find(
      user => user.email === CREATE_REGULAR_USER_DATA.email
    )

    const response = await api
      .delete(`${USERS_URL}/${regularUser!.id}`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)
  })

  test(`[DELETE] ${USERS_URL} - failure [non Admin try delete another account]`, async () => {
    const newRegularUserData = {
      email: 'james@email.com',
      name: 'James',
      password: 'Pwd@213',
    }

    await registerUser(newRegularUserData)
    await authenticateUser(newRegularUserData)

    const users = await getUsers()

    const defaultRegularUser = users.find(
      user => user.email === CREATE_REGULAR_USER_DATA.email
    )

    const response = await api
      .delete(`${USERS_URL}/${defaultRegularUser!.id}?lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized',
      message: 'Only admins can delete other account.',
      statusCode: 401,
    })
  })
})
