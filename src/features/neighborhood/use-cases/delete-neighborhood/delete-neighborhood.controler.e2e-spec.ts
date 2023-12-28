import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { getSubCityHallId } from 'src/features/sub-city-hall/shared/test-helper'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { CREATE_NEIGHBORHOOD_DATA, NEIGHBORHOODS_URL } from '../../shared/test-helper'

describe('Delete neighborhood (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string
  let neighborhood_id: string

  const getNeighborhoods = async (deleted = false): Promise<NeighborhoodEntity[]> => {
    let url = `${NEIGHBORHOODS_URL}?page=1&perPage=100`
    if (deleted) url += '&deleted=true'
    const res = await api.get(url).set('Authorization', authorization).send()
    return res.body.data
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    api = supertest(app.getHttpServer())

    await app.init()

    authorization = await getUserAuthorization(api)
    city_hall_id = await getCityHallId(api)
    sub_city_hall_id = await getSubCityHallId(api)
  })

  beforeEach(async () => {
    await api
      .post(NEIGHBORHOODS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
        sub_city_hall_id,
      })
      .timeout(4000)

    const neighborhoods = await getNeighborhoods()
    neighborhood_id = neighborhoods[0].id
  })

  afterEach(async () => {
    const neighborhoods = await getNeighborhoods()
    const deletedNeighborhoods = await getNeighborhoods(true)
    const allNeighborhoods = [...neighborhoods, ...deletedNeighborhoods]
    for (const neighborhood of allNeighborhoods) {
      await api
        .delete(`${NEIGHBORHOODS_URL}/${neighborhood.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[DELETE] ${NEIGHBORHOODS_URL} - success`, async () => {
    const response = await api
      .delete(`${NEIGHBORHOODS_URL}/${neighborhood_id}`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    const deleted = true
    const deletedNeighborhoods = await getNeighborhoods(deleted)
    expect(deletedNeighborhoods.length).toBe(0)
  })

  test(`[DELETE] ${NEIGHBORHOODS_URL} - success [soft]`, async () => {
    const response = await api
      .delete(`${NEIGHBORHOODS_URL}/${neighborhood_id}?soft=true`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(204)

    const deleted = true
    const deletedNeighborhoods = await getNeighborhoods(deleted)
    expect(deletedNeighborhoods.length).toBe(1)
  })

  test(`[DELETE] ${NEIGHBORHOODS_URL} - failure`, async () => {
    const response = await api
      .delete(`${NEIGHBORHOODS_URL}/invalid-neighborhood-id?lang=en`)
      .set('Authorization', authorization)
      .send()

    expect(response.statusCode).toBe(404)
    expect(response.body).toEqual({
      error: 'Not Found',
      message: 'Neighborhood not found.',
      statusCode: 404,
    })
  })
})
