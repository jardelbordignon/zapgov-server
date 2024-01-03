import { Supertest, supertest } from 'test/e2e.helper'

import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { CREATE_WA_ACCOUNT_DATA, WA_ACCOUNT_URL } from '../../shared/test-helper'

describe('Update whatsapp account (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string
  let wa_account_id: string

  const getAll = async () => {
    const response = await api
      .get(`${WA_ACCOUNT_URL}?page=1&perPage=1000`)
      .set('Authorization', authorization)
      .send()
    return response.body.data
  }

  beforeAll(async () => {
    api = await supertest()
    authorization = await getUserAuthorization(api)
    city_hall_id = await getCityHallId(api)

    await api
      .post(WA_ACCOUNT_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_WA_ACCOUNT_DATA,
        city_hall_id,
      })

    const getWaAccounts = await getAll()
    wa_account_id = getWaAccounts[0].id
  })

  test(`[PUT] ${WA_ACCOUNT_URL} - success`, async () => {
    const response = await api
      .put(`${WA_ACCOUNT_URL}/${wa_account_id}`)
      .set('Authorization', authorization)
      .send({ acronym: 'TEST' })

    console.log('response.body', response.body)

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ acronym: 'TEST' }))
  })

  // test(`[PUT] ${WA_ACCOUNT_URL} - failure (invalid city_hall_id)`, async () => {
  //   const response = await api
  //     .post(`${WA_ACCOUNT_URL}?lang=en`)
  //     .set('Authorization', authorization)
  //     .send({
  //       ...CREATE_WA_ACCOUNT_DATA,
  //       city_hall_id: randomUUID(),
  //     })

  //   expect(response.statusCode).toBe(404)
  //   expect(response.body).toEqual({
  //     error: 'Not Found',
  //     message: `City hall not found.`,
  //     statusCode: 404,
  //   })
  // })

  // test(`[PUT] ${WA_ACCOUNT_URL} - failure (same acronym)`, async () => {
  //   const response = await api
  //     .post(`${WA_ACCOUNT_URL}?lang=en`)
  //     .set('Authorization', authorization)
  //     .send({
  //       ...CREATE_WA_ACCOUNT_DATA,
  //       city_hall_id,
  //     })

  //   expect(response.statusCode).toBe(409)
  //   expect(response.body).toEqual({
  //     error: 'Conflict',
  //     message: `Already exists a whatsapp account with acronym ${CREATE_WA_ACCOUNT_DATA.acronym}.`,
  //     statusCode: 409,
  //   })
  // })

  // test(`[PUT] ${WA_ACCOUNT_URL} - failure (same phone number)`, async () => {
  //   const response = await api
  //     .post(`${WA_ACCOUNT_URL}?lang=en`)
  //     .set('Authorization', authorization)
  //     .send({
  //       acronym: 'NEW_WA',
  //       city_hall_id,
  //       phone: CREATE_WA_ACCOUNT_DATA.phone,
  //     })

  //   expect(response.statusCode).toBe(409)
  //   expect(response.body).toEqual({
  //     error: 'Conflict',
  //     message: `Already exists a whatsapp account with number ${CREATE_WA_ACCOUNT_DATA.phone}.`,
  //     statusCode: 409,
  //   })
  // })
})
