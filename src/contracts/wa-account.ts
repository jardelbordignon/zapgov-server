import type { WaAccount } from '@prisma/client'

export type CreateWaAccountData = Pick<
  WaAccount,
  'city_hall_id' | 'acronym' | 'phone'
>

export type UpdateWaAccountData = Partial<CreateWaAccountData>
