import { Supertest, supertest } from 'test/e2e.helper'

import { CreateNeighborhoodData } from 'src/contracts/neighborhoods'
import { getSubCityHallId } from 'src/features/sub-city-hall/shared/test-helper'

import { CREATE_NEIGHBORHOOD_DATA, NEIGHBORHOODS_URL } from '../../shared/test-helper'

describe('Create city-hall (E2E)', () => {
  let api: Supertest

  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string
  let newNeighborhoodData: CreateNeighborhoodData

  beforeAll(async () => {
    api = await supertest()

    const result = await getSubCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id
    sub_city_hall_id = result.sub_city_hall_id

    newNeighborhoodData = {
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      sub_city_hall_id,
    }
  })

  test(`[POST] ${NEIGHBORHOODS_URL} - success`, async () => {
    const response = await api
      .post(NEIGHBORHOODS_URL)
      .set('Authorization', authorization)
      .send(newNeighborhoodData)
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${NEIGHBORHOODS_URL} - failure [non-existent city hall]`, async () => {
    const response = await api
      .post(`${NEIGHBORHOODS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_NEIGHBORHOOD_DATA,
        sub_city_hall_id,
      })
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'City hall not found.',
      statusCode: 404,
    })
  })

  test(`[POST] ${NEIGHBORHOODS_URL} - failure [non-existent sub city hall]`, async () => {
    const response = await api
      .post(`${NEIGHBORHOODS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
      })
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'Sub city hall not found.',
      statusCode: 404,
    })
  })

  test(`[POST] ${NEIGHBORHOODS_URL} - failure [neighborhood with same name]`, async () => {
    await api
      .post(NEIGHBORHOODS_URL)
      .set('Authorization', authorization)
      .send(newNeighborhoodData)

    const response = await api
      .post(`${NEIGHBORHOODS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send(newNeighborhoodData)

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Neighborhood with ${CREATE_NEIGHBORHOOD_DATA.name} name already exists in the sub city hall.`,
      statusCode: 409,
    })
  })
})
