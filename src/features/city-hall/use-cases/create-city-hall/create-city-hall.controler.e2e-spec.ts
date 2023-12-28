import { Supertest, supertest } from 'test/e2e.helper'

import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { CITY_HALLS_URL, CREATE_CITY_HALL_DATA } from '../../shared/test-helper'

describe('Create city-hall (E2E)', () => {
  let api: Supertest
  let authorization: string

  beforeAll(async () => {
    api = await supertest()
    authorization = await getUserAuthorization(api)
  })

  test(`[POST] ${CITY_HALLS_URL} - success`, async () => {
    // const response = await api
    //   .post(CITY_HALLS_URL)
    //   .set('Authorization', authorization)
    //   .send(CREATE_CITY_HALL_DATA)

    //   email: 'city-hall-x@email.com',
    // name: 'City Hall X',
    // phone: '54 3333 3333',
    // slug: 'city-hall-x',
    // txt_color: '#222222',

    //   for (const [key, value] of Object.entries(CREATE_CITY_HALL_DATA)) {
    //     if (typeof value === 'string') {
    //       request = request.field(key, value)
    //     }
    //   }

    // console.log('request', request)
    const response = await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .field('name', CREATE_CITY_HALL_DATA.name)
      .field('email', CREATE_CITY_HALL_DATA.email!)
      .field('phone', CREATE_CITY_HALL_DATA.phone!)
      .field('slug', CREATE_CITY_HALL_DATA.slug)
      .field('txt_color', CREATE_CITY_HALL_DATA.txt_color)
    //.attach('file', './test/software-testing.jpg')
    expect(response.statusCode).toBe(201)
  })

  test(`[POST] ${CITY_HALLS_URL} - failure (same e-mail)`, async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)

    const response = await api
      .post(`${CITY_HALLS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        slug: 'slug-not-in-use',
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.email} email address already exists.`,
      statusCode: 409,
    })
  })

  test(`[POST] ${CITY_HALLS_URL} - failure (same slug)`, async () => {
    await api
      .post(CITY_HALLS_URL)
      .set('Authorization', authorization)
      .send(CREATE_CITY_HALL_DATA)

    const response = await api
      .post(`${CITY_HALLS_URL}?lang=en`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_CITY_HALL_DATA,
        email: 'email-not-in-use@email.com',
      })

    expect(response.statusCode).toBe(409)
    expect(response.body).toEqual({
      error: 'Conflict',
      message: `City hall with ${CREATE_CITY_HALL_DATA.slug} slug already exists.`,
      statusCode: 409,
    })
  })
})
