import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../test-helper'

describe('Delete city hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string

  const getCityHalls = async (deleted = false): Promise<CityHallEntity[]> => {
    let url = `${CITY_HALLS_URL}?page=1&perPage=100`
    if (deleted) url += '&deleted=true'
    const res = await api.get(url).set('Authorization', authorization).send()
    return res.body.data
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    authorization = await getUserAuthorization(api)
  })

  beforeEach(async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)
  })

  afterEach(async () => {
    const cityHalls = await getCityHalls()
    const deletedCityHalls = await getCityHalls(true)
    const allCityHalls = [...cityHalls, ...deletedCityHalls]
    for (const cityHall of allCityHalls) {
      await api
        .delete(`${CITY_HALLS_URL}/${cityHall.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[DELETE] ${CITY_HALLS_URL} - success`, async () => {
    let cityHalls = await getCityHalls()

    const defaultCityHall = cityHalls.find(
      item => item.email === CREATE_CITY_HALL_DATA.email
    )

    const response = await api
      .delete(`${CITY_HALLS_URL}/${defaultCityHall!.id}`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    cityHalls = await getCityHalls()
    expect(cityHalls.length).toBe(0)

    const deleted = true
    const deletedCityHalls = await getCityHalls(deleted)
    expect(deletedCityHalls.length).toBe(0)
  })

  test(`[DELETE] ${CITY_HALLS_URL} - success [soft]`, async () => {
    let cityHalls = await getCityHalls()

    const defaultCityHall = cityHalls.find(
      item => item.email === CREATE_CITY_HALL_DATA.email
    )

    const response = await api
      .delete(`${CITY_HALLS_URL}/${defaultCityHall!.id}?soft=true`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    cityHalls = await getCityHalls()
    expect(cityHalls.length).toBe(0)

    const deleted = true
    const deletedCityHalls = await getCityHalls(deleted)
    expect(deletedCityHalls.length).toBe(1)
  })

  test(`[DELETE] ${CITY_HALLS_URL} - failure`, async () => {
    const response = await api
      .delete(`${CITY_HALLS_URL}/invalid-sub-city-hall-id`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'City hall not found.',
      statusCode: 404,
    })
  })
})
