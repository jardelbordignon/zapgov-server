import { Supertest, supertest } from 'test/e2e.helper'

import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { CityHallEntity } from '../../city-hall.entity'
import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../../shared/test-helper'

describe('Delete city hall (E2E)', () => {
  let api: Supertest
  let authorization: string

  const getCityHalls = async (deleted?: boolean): Promise<CityHallEntity[]> => {
    let url = `${CITY_HALLS_URL}?page=1&perPage=100`
    if (deleted !== undefined) url += `&deleted=${deleted ? 'yes' : 'no'}`
    const res = await api.get(url).set('Authorization', authorization).send()
    return res.body.data
  }

  beforeAll(async () => {
    api = await supertest()
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
      .delete(`${CITY_HALLS_URL}/${defaultCityHall!.id}?lang=en`)
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
      .delete(`${CITY_HALLS_URL}/${defaultCityHall!.id}?soft=true&lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    cityHalls = await getCityHalls(false)
    expect(cityHalls.length).toBe(0)

    const deletedCityHalls = await getCityHalls(true)
    expect(deletedCityHalls.length).toBe(1)
  })

  test(`[DELETE] ${CITY_HALLS_URL} - failure`, async () => {
    const response = await api
      .delete(`${CITY_HALLS_URL}/invalid-sub-city-hall-id?lang=en`)
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
