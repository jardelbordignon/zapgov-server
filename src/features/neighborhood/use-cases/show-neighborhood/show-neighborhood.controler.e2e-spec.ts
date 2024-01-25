import { Supertest, supertest } from 'test/e2e.helper'

import { getSubCityHallId } from 'src/features/sub-city-hall/shared/test-helper'

import { CREATE_NEIGHBORHOOD_DATA, NEIGHBORHOODS_URL } from '../../shared/test-helper'

describe('Show neighborhood (E2E)', () => {
  let api: Supertest

  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string

  beforeAll(async () => {
    api = await supertest()

    const result = await getSubCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id
    sub_city_hall_id = result.sub_city_hall_id

    await api
      .post(NEIGHBORHOODS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
        sub_city_hall_id,
      })
  })

  test(`[GET] ${NEIGHBORHOODS_URL} - success`, async () => {
    const getItems = await api
      .get(NEIGHBORHOODS_URL)
      .set('Authorization', authorization)
      .send()

    const item = getItems.body.data.find(
      item => item.name === CREATE_NEIGHBORHOOD_DATA.name
    )

    const getItem = await api
      .get(`${NEIGHBORHOODS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send()

    expect(getItem.statusCode).toBe(200)
    expect(getItem.body).toEqual(
      expect.objectContaining({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
        id: expect.any(String),
        sub_city_hall_id,
      })
    )
  })

  test(`[GET] ${NEIGHBORHOODS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${NEIGHBORHOODS_URL}/invalid-neighborhood-id?lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'Neighborhood not found.',
        statusCode: 404,
      })
    )
  })
})
