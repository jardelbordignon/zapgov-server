import { Supertest, supertest } from 'test/e2e.helper'

import { getCityHallId } from 'src/features/city-hall/shared/test-helper'

import {
  CREATE_SUB_CITY_HALL_DATA,
  SUB_CITY_HALLS_URL,
} from '../../shared/test-helper'

describe('Create city-hall (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string

  beforeAll(async () => {
    api = await supertest()

    const result = await getCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id
  })

  test(`[POST] ${SUB_CITY_HALLS_URL} - success`, async () => {
    const response = await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${SUB_CITY_HALLS_URL} - failure [non-existent city hall]`, async () => {
    const response = await api
      .post(`${SUB_CITY_HALLS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send(CREATE_SUB_CITY_HALL_DATA)
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'City hall not found.',
      statusCode: 404,
    })
  })

  test(`[POST] ${SUB_CITY_HALLS_URL} - failure [sub city hall with same email]`, async () => {
    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })

    const response = await api
      .post(`${SUB_CITY_HALLS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Sub city hall with ${CREATE_SUB_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })
})
