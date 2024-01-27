import { Supertest } from 'test/e2e.helper'

import { CreateNeighborhoodData } from 'src/contracts/neighborhoods'
import { getSubCityHallId } from 'src/features/sub-city-hall/shared/test-helper'

import { NEIGHBORHOODS_URL } from './constants'

export * from './constants'

export const CREATE_NEIGHBORHOOD_DATA: CreateNeighborhoodData = {
  cep: '00000-000',
  city_hall_id: '049b03dc-dfff-44c1-bd64-b1b2c381a425',
  locality: 'Some locality',
  name: 'Neighborhood X',
  observation: 'Default fake neighborhood data for testing',
  sub_city_hall_id: '049b03dc-dfff-44c1-bd64-b1b2c381a425',
}

export const getNeighborhoodId = async (api: Supertest) => {
  const { authorization, city_hall_id, sub_city_hall_id } =
    await getSubCityHallId(api)

  await api
    .post(NEIGHBORHOODS_URL)
    .set('Authorization', authorization)
    .send({ ...CREATE_NEIGHBORHOOD_DATA, city_hall_id, sub_city_hall_id })

  const getNeighborhoods = await api
    .get(NEIGHBORHOODS_URL)
    .set('Authorization', authorization)
    .send()

  return getNeighborhoods.body.data[0].id
}
