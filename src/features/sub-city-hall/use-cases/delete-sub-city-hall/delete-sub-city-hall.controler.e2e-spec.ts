import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getCityHallId } from 'src/features/city-hall/use-cases/test-helper'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { CREATE_SUB_CITY_HALL_DATA, SUB_CITY_HALLS_URL } from '../test-helper'

describe('Delete sub city hall (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  let city_hall_id: string

  const getSubCityHalls = async (deleted = false): Promise<SubCityHallEntity[]> => {
    let url = `${SUB_CITY_HALLS_URL}?page=1&perPage=100`
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
    city_hall_id = await getCityHallId(api)
  })

  beforeEach(async () => {
    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })
  })

  afterEach(async () => {
    const subSubCityHalls = await getSubCityHalls()
    const deletedSubCityHalls = await getSubCityHalls(true)
    const allSubCityHalls = [...subSubCityHalls, ...deletedSubCityHalls]
    for (const subSubCityHall of allSubCityHalls) {
      await api
        .delete(`${SUB_CITY_HALLS_URL}/${subSubCityHall.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[DELETE] ${SUB_CITY_HALLS_URL} - success`, async () => {
    let subSubCityHalls = await getSubCityHalls()

    const defaultSubCityHall = subSubCityHalls.find(
      item => item.email === CREATE_SUB_CITY_HALL_DATA.email
    )

    const response = await api
      .delete(`${SUB_CITY_HALLS_URL}/${defaultSubCityHall.id}`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    subSubCityHalls = await getSubCityHalls()
    expect(subSubCityHalls.length).toBe(0)

    const deleted = true
    const deletedSubCityHalls = await getSubCityHalls(deleted)
    expect(deletedSubCityHalls.length).toBe(0)
  })

  test(`[DELETE] ${SUB_CITY_HALLS_URL} - success [soft]`, async () => {
    let subSubCityHalls = await getSubCityHalls()

    const defaultSubCityHall = subSubCityHalls.find(
      item => item.email === CREATE_SUB_CITY_HALL_DATA.email
    )

    const response = await api
      .delete(`${SUB_CITY_HALLS_URL}/${defaultSubCityHall.id}?soft=true`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    subSubCityHalls = await getSubCityHalls()
    expect(subSubCityHalls.length).toBe(0)

    const deleted = true
    const deletedSubCityHalls = await getSubCityHalls(deleted)
    expect(deletedSubCityHalls.length).toBe(1)
  })

  test(`[DELETE] ${SUB_CITY_HALLS_URL} - failure`, async () => {
    const response = await api
      .delete(`${SUB_CITY_HALLS_URL}/invalid-sub-city-hall-id`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'Sub city hall not found.',
      statusCode: 404,
    })
  })
})
