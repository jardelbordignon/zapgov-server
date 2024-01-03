import { Supertest, supertest } from 'test/e2e.helper'

import { CreateWaAccountData } from 'src/contracts/wa-account'
import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { WA_ACCOUNT_URL } from '../../shared/test-helper'

describe('List whatsapp account (E2E)', () => {
  let api: Supertest
  let authorization: string
  let city_hall_id: string

  const acronyms = ['AB1', 'CD2', 'EF3']

  beforeAll(async () => {
    api = await supertest()
    authorization = await getUserAuthorization(api)
    city_hall_id = await getCityHallId(api)

    for (const [index, value] of acronyms.entries()) {
      const data: CreateWaAccountData = {
        acronym: value,
        city_hall_id,
        phone: `54 99999999${index}`,
      }

      await api.post(WA_ACCOUNT_URL).set('Authorization', authorization).send(data)
    }
  })

  test(`[GET] ${WA_ACCOUNT_URL}`, async () => {
    const getWaAccounts = await api
      .get(WA_ACCOUNT_URL)
      .set('Authorization', authorization)
      .send()

    expect(getWaAccounts.statusCode).toBe(200)
    expect(getWaAccounts.body.data.length).toBe(3)
    expect(getWaAccounts.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            acronym: 'AB1',
            id: expect.any(String),
            phone: '54 999999990',
          }),
          expect.objectContaining({ acronym: 'AB1' }),
          expect.objectContaining({ acronym: 'CD2' }),
          expect.objectContaining({ acronym: 'EF3' }),
        ]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 20,
          totalItems: 3,
          totalPages: 1,
        },
      })
    )
  })

  test(`[GET] ${WA_ACCOUNT_URL} search term`, async () => {
    const getWaAccounts = await api
      .get(`${WA_ACCOUNT_URL}?page=1&perPage=3&search=a`)
      .set('Authorization', authorization)
      .send()

    expect(getWaAccounts.statusCode).toBe(200)
    expect(getWaAccounts.body.data.length).toBe(1)
    expect(getWaAccounts.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([expect.objectContaining({ acronym: 'AB1' })]),
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
