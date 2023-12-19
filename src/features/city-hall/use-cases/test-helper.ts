import { CreateCityHallData } from 'src/contracts/city-halls'
import { getUserAuthorization } from 'src/features/user/use-cases/test-helper'

import { CITY_HALLS_URL } from './constants'

export const CREATE_CITY_HALL_DATA: CreateCityHallData = {
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
    .field('name', CREATE_CITY_HALL_DATA.name)
    .field('email', CREATE_CITY_HALL_DATA.email!)
    .field('phone', CREATE_CITY_HALL_DATA.phone!)
    .field('slug', CREATE_CITY_HALL_DATA.slug)
    .field('txt_color', CREATE_CITY_HALL_DATA.txt_color)
    .attach('file', '/test/software-testing.jpg')

  const getCityHalls = await api
    .get(CITY_HALLS_URL)
    .set('Authorization', authorization)
    .send()

  console.log('getCityHalls', getCityHalls)

  return getCityHalls.body.data[0].id
}
