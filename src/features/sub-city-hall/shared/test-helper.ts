import supertest from 'supertest'

import { CreateSubCityHallData } from 'src/contracts/sub-city-halls'
import { getCityHallId } from 'src/features/city-hall/shared/test-helper'

import { SUB_CITY_HALLS_URL } from './constants'

export * from './constants'

export const CREATE_SUB_CITY_HALL_DATA: CreateSubCityHallData = {
  city_hall_id: '049b03dc-dfff-44c1-bd64-b1b2c381a425',
  email: 'sub-city-hall-x@email.com',
  name: 'Sub City Hall X',
  observation: 'Default fake sub city hall data for testing',
  phone: '54 3333 3333',
}

export const getSubCityHallId = async (api: supertest.SuperTest<supertest.Test>) => {
  const { authorization, city_hall_id } = await getCityHallId(api)

  await api
    .post(SUB_CITY_HALLS_URL)
    .set('Authorization', authorization)
    .send({ ...CREATE_SUB_CITY_HALL_DATA, city_hall_id })

  const getSubCityHalls = await api
    .get(SUB_CITY_HALLS_URL)
    .set('Authorization', authorization)
    .send()

  const sub_city_hall_id = getSubCityHalls.body.data[0].id

  return { authorization, city_hall_id, sub_city_hall_id }
}
