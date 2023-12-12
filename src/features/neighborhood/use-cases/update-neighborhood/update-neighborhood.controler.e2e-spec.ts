import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import supertest from 'supertest'

import { AppModule } from 'src/app.module'
import { getCityHallId } from 'src/features/city-hall/use-cases/test-helper'
import { getSubCityHallId } from 'src/features/sub-city-hall/use-cases/test-helper'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { CREATE_NEIGHBORHOOD_DATA, NEIGHBORHOODS_URL } from '../test-helper'

describe('Update user (E2E)', () => {
  let api: supertest.SuperTest<supertest.Test>
  let app: INestApplication

  let authorization: string
  let city_hall_id: string
  let sub_city_hall_id: string

  const getAll = async (deleted = false): Promise<NeighborhoodEntity[]> => {
    let url = `${NEIGHBORHOODS_URL}?page=1&perPage=1000`
    if (deleted) url += '&deleted=true'
    const response = await api.get(url).set('Authorization', authorization).send()
    return response.body.data
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
    console.log('\n\n\n\n\n\nBeforeEach ------------------\n\n\n\n\n\n')
    console.log({
      ...CREATE_NEIGHBORHOOD_DATA,
      city_hall_id,
      sub_city_hall_id,
    })

    const response = await api
      .post(NEIGHBORHOODS_URL)
      .set('Authorization', authorization)
      .send({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
        sub_city_hall_id,
      })

    console.log('response.body', response.body)
  })

  afterEach(async () => {
    const items = await getAll()
    const deletedItems = await getAll(true)
    const allItems = [...items, ...deletedItems]
    for (const item of allItems) {
      await api
        .delete(`${NEIGHBORHOODS_URL}/${item.id}`)
        .set('Authorization', authorization)
        .send()
    }
  })

  test(`[PUT] ${NEIGHBORHOODS_URL} - success`, async () => {
    const items = await getAll()
    const item = items.find(item => item.name === CREATE_NEIGHBORHOOD_DATA.name)

    const name = `Updated ${CREATE_NEIGHBORHOOD_DATA.name}`
    const response = await api
      .put(`${NEIGHBORHOODS_URL}/${item.id}`)
      .set('Authorization', authorization)
      .send({
        ...CREATE_NEIGHBORHOOD_DATA,
        city_hall_id,
        name,
        sub_city_hall_id,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual(expect.objectContaining({ name }))
  })

  // test(`[PUT] ${NEIGHBORHOODS_URL} - failure (same name)`, async () => {
  //   const name = 'New neighborhood'

  //   const res = await api
  //     .post(NEIGHBORHOODS_URL)
  //     .set('Authorization', authorization)
  //     .send({
  //       ...CREATE_NEIGHBORHOOD_DATA,
  //       city_hall_id,
  //       name,
  //       sub_city_hall_id,
  //     })

  //   console.log('res', res.body)

  //   const items = await getAll()
  //   const newNeighborhood = items.find(item => item.name === name)

  //   const response = await api
  //     .put(`${NEIGHBORHOODS_URL}/${newNeighborhood.id}`)
  //     .set('Authorization', authorization)
  //     .send({ name: CREATE_NEIGHBORHOOD_DATA.name })

  //   expect(response.statusCode).toBe(409)
  //   expect(response.body).toEqual({
  //     error: 'Conflict',
  //     message: `Neighborhood with ${CREATE_NEIGHBORHOOD_DATA.name} name already exists.`,
  //     statusCode: 409,
  //   })
  // })
})
