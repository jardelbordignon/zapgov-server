import { randomUUID } from 'node:crypto'

import { Supertest, supertest } from 'test/e2e.helper'

import { getCityHallId } from 'src/features/city-hall/shared/test-helper'

import { CREATE_WA_ACCOUNT_DATA, WA_ACCOUNT_URL } from '../../shared/test-helper'

describe('Create whatsapp account (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string

  beforeAll(async () => {
    api = await supertest()

    const result = await getCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id
  })

  test(`[POST] ${WA_ACCOUNT_URL} - success`, async () => {
    const response = await api
      .post(WA_ACCOUNT_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_WA_ACCOUNT_DATA,
        city_hall_id,
      })
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${WA_ACCOUNT_URL} - failure (invalid city_hall_id)`, async () => {
    const response = await api
      .post(`${WA_ACCOUNT_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_WA_ACCOUNT_DATA,
        city_hall_id: randomUUID(),
      })

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: `City hall not found.`,
      statusCode: 404,
    })
  })

  test(`[POST] ${WA_ACCOUNT_URL} - failure (same acronym)`, async () => {
    const response = await api
      .post(`${WA_ACCOUNT_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_WA_ACCOUNT_DATA,
        city_hall_id,
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Already exists a whatsapp account with acronym ${CREATE_WA_ACCOUNT_DATA.acronym}.`,
      statusCode: 409,
    })
  })

  test(`[POST] ${WA_ACCOUNT_URL} - failure (same phone number)`, async () => {
    const response = await api
      .post(`${WA_ACCOUNT_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        acronym: 'NEW_WA',
        city_hall_id,
        phone: CREATE_WA_ACCOUNT_DATA.phone,
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Already exists a whatsapp account with number ${CREATE_WA_ACCOUNT_DATA.phone}.`,
      statusCode: 409,
    })
  })
})
