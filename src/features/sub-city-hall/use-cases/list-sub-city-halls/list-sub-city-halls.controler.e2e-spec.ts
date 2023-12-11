import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getCityHallId } from 'src/features/city-hall/use-cases/test-helper'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'
import { slugify } from 'src/infra/utils/text-formatters'

import { CREATE_SUB_CITY_HALL_DATA, SUB_CITY_HALLS_URL } from '../test-helper'

describe('List sub city halls (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  let city_hall_id: string

  const subCityHallNames = ['SCH A', 'SCH B', 'SCH C']

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    authorization = await getUserAuthorization(api)
    city_hall_id = await getCityHallId(api)

    for (const name of subCityHallNames) {
      await api
        .post(SUB_CITY_HALLS_URL)
        .set('Authorization', authorization)
        .send({
          ...CREATE_SUB_CITY_HALL_DATA,
          city_hall_id,
          email: `${slugify(name)}@email.com`,
          name,
        })
    }
  })

  test(`[GET] ${SUB_CITY_HALLS_URL}`, async () => {
    const getCityHalls = await api
      .get(`${SUB_CITY_HALLS_URL}?page=1&perPage=3`)
      .send()

    expect(getCityHalls.statusCode).toBe(200)
    expect(getCityHalls.body.data.length).toBe(3)
    expect(getCityHalls.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            city_hall_id,
            email: `sch-a@email.com`,
            name: 'SCH A',
          }),
          expect.objectContaining({ name: 'SCH B' }),
          expect.objectContaining({ name: 'SCH C' }),
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

  test(`[GET] ${SUB_CITY_HALLS_URL} search term`, async () => {
    const getCityHalls = await api
      .get(`${SUB_CITY_HALLS_URL}?page=1&perPage=3&search=b`)
      .send()

    expect(getCityHalls.statusCode).toBe(200)
    expect(getCityHalls.body.data.length).toBe(1)
    expect(getCityHalls.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ name: 'SCH B' })]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 3,
          totalItems: 1,
          totalPages: 1,
        },
      })
    )
  })
})
