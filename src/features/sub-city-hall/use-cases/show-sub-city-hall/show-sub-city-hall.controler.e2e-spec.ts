import { Supertest, supertest } from 'test/e2e.helper'

import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import {
  CREATE_SUB_CITY_HALL_DATA,
  SUB_CITY_HALLS_URL,
} from '../../shared/test-helper'

describe('Show sub city hall (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string

  beforeAll(async () => {
    api = await supertest()
    authorization = await getUserAuthorization(api)
    city_hall_id = await getCityHallId(api)

    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })
  })

  test(`[GET] ${SUB_CITY_HALLS_URL} - success`, async () => {
    const getItems = await api
      .get(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send()

    const item = getItems.body.data.find(
      item => item.email === CREATE_SUB_CITY_HALL_DATA.email
    )

    const getItem = await api
      .get(`${SUB_CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send()

    expect(getItem.statusCode).toBe(200)
    expect(getItem.body).toEqual(
      expect.objectContaining({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id: expect.any(String),
        id: expect.any(String),
      })
    )
  })

  test(`[GET] ${SUB_CITY_HALLS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${SUB_CITY_HALLS_URL}/invalid-sub-city-hall-id?lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'Sub city hall not found.',
        statusCode: 404,
      })
    )
  })
})
