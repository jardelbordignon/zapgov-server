import { Supertest, supertest } from 'test/e2e.helper'

import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../../shared/test-helper'

describe('Update user (E2E)', () => {
  let api: Supertest
  let authorization: string

  const getAll = async () => {
    const response = await api
      .get(`${CITY_HALLS_URL}?page=1&perPage=1000`)
      .set('Authorization', authorization)
      .send()
    return response.body.data
  }

  beforeAll(async () => {
    api = await supertest()
    authorization = await getUserAuthorization(api)

    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)
  })

  // beforeEach(async () => {
  //   await api
  //     .post(CITY_HALLS_URL)
  //     .set('Authorization', authorization)
  //     .send(CREATE_CITY_HALL_DATA)
  // })

  // afterEach(async () => {
  //   const items = await getAll()
  //   for (const item of items) {
  //     await api
  //       .delete(`${CITY_HALLS_URL}/${item.id}`)
  //       .set('Authorization', authorization)
  //       .send()
  //   }
  // })

  test(`[PUT] ${CITY_HALLS_URL} - success`, async () => {
    const items = await getAll()
    const item = items.find(item => item.email === CREATE_CITY_HALL_DATA.email)

    const updatedName = `Updated ${CREATE_CITY_HALL_DATA.name}`
    const response = await api
      .put(`${CITY_HALLS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send({ name: updatedName })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name: updatedName }))
  })

  test(`[PUT] ${CITY_HALLS_URL} - failure (same email)`, async () => {
    const cancunEmail = 'cancun@email.com'
    const cancunSlug = 'cancun'
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        email: cancunEmail,
        name: 'Cancun',
        slug: cancunSlug,
      })

    const items = await getAll()
    const item = items.find(item => item.email === cancunEmail)

    const response = await api
      .put(`${CITY_HALLS_URL}/${item.id}?lang=en`)
      .set('Authorization', authorization)
      .send({ email: CREATE_CITY_HALL_DATA.email })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })

  test(`[PUT] ${CITY_HALLS_URL} - failure (same slug)`, async () => {
    const cancunEmail = 'cancun@email.com'
    const cancunSlug = 'cancun'
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        email: cancunEmail,
        name: 'Cancun',
        slug: cancunSlug,
      })

    const items = await getAll()
    const item = items.find(item => item.email === cancunEmail)

    const response = await api
      .put(`${CITY_HALLS_URL}/${item.id}?lang=en`)
      .set('Authorization', authorization)
      .send({ slug: CREATE_CITY_HALL_DATA.slug })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.slug} slug already exists.`,
      statusCode: 409,
    })
  })
})
