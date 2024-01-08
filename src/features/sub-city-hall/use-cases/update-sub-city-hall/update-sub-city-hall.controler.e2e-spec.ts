import { Supertest, supertest } from 'test/e2e.helper'

import { getCityHallId } from 'src/features/city-hall/shared/test-helper'

import {
  CREATE_SUB_CITY_HALL_DATA,
  SUB_CITY_HALLS_URL,
} from '../../shared/test-helper'
import { SubCityHallEntity } from '../../sub-city-hall.entity'

describe('Update sub city hall (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string

  const getAll = async (deleted?: boolean): Promise<SubCityHallEntity[]> => {
    let url = `${SUB_CITY_HALLS_URL}?page=1&perPage=1000`
    if (deleted !== undefined) url += `&deleted=${deleted ? 'yes' : 'no'}`
    const response = await api.get(url).set('Authorization', authorization).send()
    return response.body.data
  }

  beforeAll(async () => {
    api = await supertest()

    const result = await getCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id
  })

  beforeEach(async () => {
    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
      })
    const subSubCityHalls = await getAll()
    sub_city_hall_id = subSubCityHalls[0].id
  })

  afterEach(async () => {
    const items = await getAll()
    const deletedItems = await getAll(true)
    const allItems = [...items, ...deletedItems]
    for (const item of allItems) {
      await api
        .delete(`${SUB_CITY_HALLS_URL}/${item.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[PUT] ${SUB_CITY_HALLS_URL} - success`, async () => {
    const updatedName = `Updated ${CREATE_SUB_CITY_HALL_DATA.name}`
    const response = await api
      .put(`${SUB_CITY_HALLS_URL}/${sub_city_hall_id}`)
      .set('Authorization', authorization)
      .send({ name: updatedName })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test(`[PUT] ${SUB_CITY_HALLS_URL} - failure (same email)`, async () => {
    const email = 'new-sub-city-hall@email.com'
    await api
      .post(SUB_CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_SUB_CITY_HALL_DATA,
        city_hall_id,
        email,
      })

    const items = await getAll()
    const newSubCityHall = items.find(item => item.email === email)

    const response = await api
      .put(`${SUB_CITY_HALLS_URL}/${newSubCityHall!.id}?lang=en`)
      .set('Authorization', authorization)
      .send({ email: CREATE_SUB_CITY_HALL_DATA.email })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Sub city hall with ${CREATE_SUB_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })
})
