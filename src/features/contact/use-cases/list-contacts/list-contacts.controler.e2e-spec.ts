import { Supertest, supertest } from 'test/e2e.helper'

import { CreateContactData } from 'src/contracts/contacts'
import { getWaAccountId } from 'src/features/wa-account/shared/test-helper'

import { CONTACTS_URL } from '../../shared/test-helper'

describe('List contacts (E2E)', () => {
  let api: Supertest

  const contactNames = ['John', 'Joe', 'James']

  beforeAll(async () => {
    api = await supertest()

    const { authorization, city_hall_id, wa_account_id } = await getWaAccountId(api)

    for (const [index, value] of contactNames.entries()) {
      const data: CreateContactData = {
        gender: index % 2 == 0 ? 'Male' : 'Female',
        name: value,
        phone: `51 99543210${index}`,
        wa_account_id,
      }

      await api
        .post(CONTACTS_URL)
        .set('Authorization', authorization)
        .send({ ...data, city_hall_id })
    }
  })

  test(`[GET] ${CONTACTS_URL}`, async () => {
    const getContacts = await api.get(CONTACTS_URL).send()

    expect(getContacts.statusCode).toBe(200)
    expect(getContacts.body.data.length).toBe(3)
    expect(getContacts.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            name: 'John',
            phone: '51 995432100',
          }),
          expect.objectContaining({ nome: 'Joe' }),
          expect.objectContaining({ name: 'James' }),
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

  test.only(`[GET] ${CONTACTS_URL} filter`, async () => {
    const getContacts = await api
      .get(`${CONTACTS_URL}?page=1&perPage=3&filter=name=jo`)
      .send()

    expect(getContacts.statusCode).toBe(200)
    expect(getContacts.body.data.length).toBe(2)
    expect(getContacts.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'John' }),
          expect.objectContaining({ name: 'Joe' }),
          //expect.objectContaining({ name: 'James' }),
        ]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 3,
          totalItems: 2,
          totalPages: 1,
        },
      })
    )
  })
})
