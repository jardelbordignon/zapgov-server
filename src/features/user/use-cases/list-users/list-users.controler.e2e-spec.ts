import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { CreateUserData } from 'src/contracts/account'

import { USERS_URL } from '../constants'

describe('List users (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  const password = 'Pwd@123'
  const names = ['John', 'Joe', 'James']

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    for (const name of names) {
      const createUserData: CreateUserData = {
        email: `${name.toLocaleLowerCase()}@email.com`,
        name,
        password,
      }

      await api.post(USERS_URL).send(createUserData)
    }
  })

  test(`[GET] ${USERS_URL}`, async () => {
    const getUsers = await api.get(USERS_URL).send()

    expect(getUsers.statusCode).toBe(200)
    expect(getUsers.body.length).toBe(3)
    expect(getUsers.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ email: 'john@email.com', name: 'John' }),
        expect.objectContaining({ email: 'joe@email.com', name: 'Joe' }),
      ])
    )
  })
})
