import { Supertest, supertest } from 'test/e2e.helper'

import { getSubCityHallId } from 'src/features/sub-city-hall/shared/test-helper'

import { CREATE_NEIGHBORHOOD_DATA, NEIGHBORHOODS_URL } from '../../shared/test-helper'

describe('List neighborhoods (E2E)', () => {
  let api: Supertest

  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string

  const neighborhoodNames = ['Neighborhood A', 'Neighborhood B', 'Neighborhood C']

  beforeAll(async () => {
    api = await supertest()

    const result = await getSubCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id
    sub_city_hall_id = result.sub_city_hall_id

    for (const name of neighborhoodNames) {
      await api
        .post(NEIGHBORHOODS_URL)
        .set('Authorization', authorization)
        .send({
          ...CREATE_NEIGHBORHOOD_DATA,
          city_hall_id,
          name,
          sub_city_hall_id,
        })
    }
  })

  test(`[GET] ${NEIGHBORHOODS_URL}`, async () => {
    const getNeighborhoods = await api
      .get(`${NEIGHBORHOODS_URL}?page=1&perPage=3`)
      .set('Authorization', authorization)
      .send()

    expect(getNeighborhoods.statusCode).toBe(200)
    expect(getNeighborhoods.body.data.length).toBe(3)
    expect(getNeighborhoods.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            city_hall_id,
            name: 'Neighborhood A',
            sub_city_hall_id,
          }),
          expect.objectContaining({ name: 'Neighborhood B' }),
          expect.objectContaining({ name: 'Neighborhood C' }),
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

  test(`[GET] ${NEIGHBORHOODS_URL} search term`, async () => {
    const getNeighborhoods = await api
      .get(`${NEIGHBORHOODS_URL}?page=1&perPage=3&filter=name:c`)
      .send()

    expect(getNeighborhoods.statusCode).toBe(200)
    expect(getNeighborhoods.body.data.length).toBe(1)
    expect(getNeighborhoods.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Neighborhood C' }),
        ]),
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
