import { randomUUID } from 'node:crypto'

import { Supertest, supertest } from 'test/e2e.helper'

import type { CreateWaAccountData } from 'src/contracts/wa-account'
import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { WA_ACCOUNT_URL } from 'src/features/wa-account/shared/constants'

import { CONTACTS_URL, CREATE_CONTACT_DATA } from '../../shared/test-helper'

describe('Create contact (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string

  beforeAll(async () => {
    api = await supertest()

    const result = await getCityHallId(api)
    authorization = result.authorization
    city_hall_id = result.city_hall_id

    const data: CreateWaAccountData = {
      acronym: 'AB1',
      city_hall_id,
      phone: '54 999999999',
    }
    await api.post(WA_ACCOUNT_URL).set('Authorization', authorization).send(data)
  })

  test(`[POST] ${CONTACTS_URL} - success`, async () => {
    const response = await api
      .post(CONTACTS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CONTACT_DATA,
        city_hall_id,
      })
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${CONTACTS_URL} - failure [without inform city hall]`, async () => {
    const response = await api
      .post(`${CONTACTS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send(CREATE_CONTACT_DATA)
    expect(response.statusCode).toBe(400)
  })

  test(`[POST] ${CONTACTS_URL} - failure [non-existent city hall]`, async () => {
    const response = await api
      .post(`${CONTACTS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({ ...CREATE_CONTACT_DATA, city_hall_id: randomUUID() })
    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'City hall not found.',
      statusCode: 404,
    })
  })

  test(`[POST] ${CONTACTS_URL} - failure [contact with same phone number]`, async () => {
    await api
      .post(CONTACTS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CONTACT_DATA,
        city_hall_id,
      })

    const response = await api
      .post(`${CONTACTS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CONTACT_DATA,
        city_hall_id,
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `Contact with ${CREATE_CONTACT_DATA.phone} phone number already exists.`,
      statusCode: 409,
    })
  })
})
