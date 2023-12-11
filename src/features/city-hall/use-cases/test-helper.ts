import { CreateCityHallData } from 'src/contracts/city-halls'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { CITY_HALLS_URL } from './constants'

export const CREATE_CITY_HALL_DATA: CreateCityHallData = {
  bg_image: '#f2f2f2',
  email: 'city-hall-x@email.com',
  name: 'City Hall X',
  phone: '54 3333 3333',
  slug: 'city-hall-x',
  txt_color: '#222222',
}

export * from './constants'

export const getCityHallId = async (api: any) => {
  const authorization = await getUserAuthorization(api)
  await api
    .post(CITY_HALLS_URL)
    .set('Authorization', authorization)
    .send(CREATE_CITY_HALL_DATA)

  const getCityHalls = await api
    .get(CITY_HALLS_URL)
    .set('Authorization', authorization)
    .send()

  return getCityHalls.body.data[0].id
}
