import { Supertest, supertest } from 'test/e2e.helper'

import { CreateCityHallData } from 'src/contracts/city-halls'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'
import { slugify } from 'src/infra/utils/text-formatters'

import { CITY_HALLS_URL } from '../../shared/test-helper'

describe('List city halls (E2E)', () => {
  let api: Supertest

  let authorization: string
  const cityNames = ['Tangamandapio', 'Acapulco', 'Ciudad de México']

  beforeAll(async () => {
    api = await supertest()

    authorization = await getUserAuthorization(api)

    for (const cityName of cityNames) {
      const createUserData: CreateCityHallData = {
        email: `${slugify(cityName)}@email.com`,
        name: cityName,
        phone: `01 (744) 440 700${cityName.length}`,
        slug: slugify(cityName),
        txt_color: '#000000',
      }

      await api
        .post(CITY_HALLS_URL)
        .set('Authorization', authorization)
        .field('name', createUserData.name)
        .field('email', createUserData.email!)
        .field('phone', createUserData.phone!)
        .field('slug', createUserData.slug)
        .field('txt_color', createUserData.txt_color)
      // .attach('file', './test/software-testing.jpg')
    }
  })

  test(`[GET] ${CITY_HALLS_URL}`, async () => {
    const getCityHalls = await api
      .get(`${CITY_HALLS_URL}?add=sub_city_halls,neighborhoods`)
      .send()

    expect(getCityHalls.statusCode).toBe(200)
    expect(getCityHalls.body.data.length).toBe(3)
    expect(getCityHalls.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({
            email: 'ciudad-de-mexico@email.com',
            id: expect.any(String),
            name: 'Ciudad de México',
          }),
          expect.objectContaining({ email: 'tangamandapio@email.com' }),
          expect.objectContaining({ email: 'acapulco@email.com', name: 'Acapulco' }),
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

  test(`[GET] ${CITY_HALLS_URL} filter`, async () => {
    const getCityHalls = await api
      .get(`${CITY_HALLS_URL}?page=1&perPage=3&filter=name:u`)
      .send()

    expect(getCityHalls.statusCode).toBe(200)
    expect(getCityHalls.body.data.length).toBe(2)
    expect(getCityHalls.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Ciudad de México' }),
          //expect.objectContaining({ email: 'tangamandapio@email.com' }),
          expect.objectContaining({ email: 'acapulco@email.com', name: 'Acapulco' }),
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

  test(`[GET] ${CITY_HALLS_URL} filter multiple`, async () => {
    const getCityHalls = await api
      .get(`${CITY_HALLS_URL}?filter=name:u|phone=u`)
      .send()

    expect(getCityHalls.statusCode).toBe(200)
    expect(getCityHalls.body.data.length).toBe(2)
    expect(getCityHalls.body).toEqual(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ name: 'Ciudad de México' }),
          //expect.objectContaining({ email: 'tangamandapio@email.com' }),
          expect.objectContaining({ email: 'acapulco@email.com', name: 'Acapulco' }),
        ]),
        meta: {
          hasNext: false,
          hasPrevious: false,
          page: 1,
          perPage: 20,
          totalItems: 2,
          totalPages: 1,
        },
      })
    )
  })
})
