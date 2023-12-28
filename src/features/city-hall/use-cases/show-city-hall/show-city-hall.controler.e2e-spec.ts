import { Supertest, supertest } from 'test/e2e.helper'

import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../../shared/test-helper'

describe('Show city hall (E2E)', () => {
  let api: Supertest
  let authorization: string

  beforeAll(async () => {
    api = await supertest()

    authorization = await getUserAuthorization(api)

    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)
  })

  test(`[GET] ${CITY_HALLS_URL} - success`, async () => {
    const getItems = await api
      .get(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send()

    const item = getItems.body.data.find(
      item => item.email === CREATE_CITY_HALL_DATA.email
    )

    const getItem = await api
      .get(`${CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send()

    expect(getItem.statusCode).toBe(200)
    expect(getItem.body).toEqual(
      expect.objectContaining({ ...CREATE_CITY_HALL_DATA, id: expect.any(String) })
    )
  })

  // test(`[GET] ${CITY_HALLS_URL} - success [with add]`, async () => {
  //   const getItems = await api
  //     .get(CITY_HALLS_URL)
  //     .set('Authorization', authorization)
  //     .send()

  //   const item = getItems.body.data.find(
  //     item => item.email === CREATE_CITY_HALL_DATA.email
  //   )

  //   const url = `${CITY_HALLS_URL}/${item.id}?add=neighborhoods,sub_city_halls`
  //   const getItem = await api.get(url).set('Authorization', authorization).send()

  //   expect(getItem.statusCode).toBe(200)
  //   expect(getItem.body).toEqual(
  //     expect.objectContaining({
  //       ...CREATE_CITY_HALL_DATA,
  //       id: expect.any(String),
  //       neighborhoods: expect.any(Array),
  //       subCityHalls: expect.any(Array),
  //     })
  //   )
  // })

  test(`[GET] ${CITY_HALLS_URL}/:id - failure`, async () => {
    const getUser = await api
      .get(`${CITY_HALLS_URL}/invalid-user-id?lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(getUser.statusCode).toBe(404)
    expect(getUser.body).toEqual(
      expect.objectContaining({
        error: 'Not Found',
        message: 'City hall not found.',
        statusCode: 404,
      })
    )
  })
})
