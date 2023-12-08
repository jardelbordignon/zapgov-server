import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { AuthUserData, CreateUserData } from 'src/contracts/account'
import { CreateCityHallData } from 'src/contracts/city-halls'
import { AUTH_URL, USERS_URL } from 'src/features/user/use-cases/constants'
import { slugify } from 'src/infra/utils/text-formatters'

import { CITY_HALLS_URL } from '../constants'

describe('List city halls (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  const email = 'johndoe@email.com'
  const name = 'John Doe'
  const password = 'Pwd@123'
  const cityNames = ['Tangamandapio', 'Acapulco', 'Ciudad de México']

  const registerUser = async (data: CreateUserData) => {
    await api.post(USERS_URL).send(data)
  }

  const authenticate = async (data: AuthUserData) => {
    const authRes = await api.post(AUTH_URL).send(data)
    authorization = `Bearer ${authRes.body.accessToken}`
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    await registerUser({ email, name, password })
    await authenticate({ email, password })

    for (const cityName of cityNames) {
      const createUserData: CreateCityHallData = {
        bg_image: '#ffffff',
        email: `${slugify(cityName)}@email.com`,
        name: cityName,
        phone: `01 (744) 440 700${cityName.length}`,
        slug: slugify(cityName),
        txt_color: '#000000',
      }

      await api
        .post(CITY_HALLS_URL)
        .set('Authorization', authorization)
        .send(createUserData)
    }
  })

  test(`[GET] ${CITY_HALLS_URL}`, async () => {
    const getCityHalls = await api.get(`${CITY_HALLS_URL}?page=1&perPage=3`).send()

    expect(getCityHalls.statusCode).toBe(200)
    expect(getCityHalls.body.data.length).toBe(3)
    expect(getCityHalls.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            email: 'ciudad-de-mexico@email.com',
            id: expect.any(String),
            name: 'Ciudad de México',
          }),
          // expect.objectContaining({ email: 'joe@email.com', name: 'Joe' }),
          // expect.objectContaining({ email: 'james@email.com', name: 'James' }),
        ]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 3,
          totalItems: 3,
          totalPages: 1,
        },
      })
    )
  })
})
