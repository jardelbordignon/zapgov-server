import { CreateWaAccountData } from 'src/contracts/wa-account'
import { getCityHallId } from 'src/features/city-hall/shared/test-helper'
import { getUserAuthorization } from 'src/features/user/shared/test-helper'

import { WA_ACCOUNT_URL } from './constants'

export * from './constants'

export const CREATE_WA_ACCOUNT_DATA: CreateWaAccountData = {
  acronym: 'ABC',
  city_hall_id: '',
  phone: '51999999999',
}

export const getWaAccountId = async (api: any) => {
  const authorization = await getUserAuthorization(api)
  const city_hall_id = await getCityHallId(api)
  await api.post(WA_ACCOUNT_URL).set('Authorization', authorization).send()

  await api
    .post(WA_ACCOUNT_URL)
    .set('Authorization', authorization)
    .send({
      ...CREATE_WA_ACCOUNT_DATA,
      city_hall_id,
    })

  const getWaAccounts = await api
    .get(WA_ACCOUNT_URL)
    .set('Authorization', authorization)
    .send()

  return getWaAccounts.body.data[0].id
}
