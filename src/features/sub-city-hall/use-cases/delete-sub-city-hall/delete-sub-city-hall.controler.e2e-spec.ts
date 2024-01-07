import { Supertest, supertest } from 'test/e2e.helper'

import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import {
  CREATE_SUB_CITY_HALL_DATA,
  SUB_CITY_HALLS_URL,
} from '../../shared/test-helper'
import { SubCityHallEntity } from '../../sub-city-hall.entity'

describe('Delete sub city hall (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string

  const getSubCityHalls = async (deleted?: boolean): Promise<SubCityHallEntity[]> => {
    let url = `${SUB_CITY_HALLS_URL}?page=1&perPage=100`
    if (deleted !== undefined) url += `&deleted=${deleted}`
    console.log('URL: ' + url)
    const res = await api.get(url).set('Authorization', authorization).send()
    return res.body.data
  }

  beforeAll(async () => {
    api = await supertest()
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

    const subSubCityHalls = await getSubCityHalls()
    sub_city_hall_id = subSubCityHalls[0].id
  })

  // afterEach(async () => {
  //   const subCityHalls = await getSubCityHalls()
  //   for (const subSubCityHall of subCityHalls) {
  //     await api
  //       .delete(`${SUB_CITY_HALLS_URL}/${subSubCityHall.id}`)
  //       .set('Authorization', authorization)
  //       .send()
  //   }
  // })

  test(`[DELETE] ${SUB_CITY_HALLS_URL} - success`, async () => {
    const response = await api
      .delete(`${SUB_CITY_HALLS_URL}/${sub_city_hall_id}`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    const subSubCityHalls = await getSubCityHalls()
    expect(subSubCityHalls.length).toBe(0)
  })

  test(`[DELETE] ${SUB_CITY_HALLS_URL} - success [soft]`, async () => {
    const response = await api
      .delete(`${SUB_CITY_HALLS_URL}/${sub_city_hall_id}?soft=true`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    const subSubCityHalls = await getSubCityHalls(false)
    expect(subSubCityHalls.length).toBe(0)

    // const deletedSubCityHalls = await getSubCityHalls(true)
    // expect(deletedSubCityHalls.length).toBe(1)
  })

  test(`[DELETE] ${SUB_CITY_HALLS_URL} - failure`, async () => {
    const response = await api
      .delete(`${SUB_CITY_HALLS_URL}/invalid-sub-city-hall-id?lang=en`)
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
