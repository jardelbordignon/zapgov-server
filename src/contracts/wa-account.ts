import type { WaAccount } from '@prisma/client'

// export type CreateWaAccountData = Pick<
//   WaAccount,
//   'city_hall_id' | 'acronym' | 'phone'
// >

// export type UpdateWaAccountData = Partial<CreateWaAccountData>

type OmitOnUpdate = 'id' | 'created_at' | 'updated_at'
type OmitOnCreate = OmitOnUpdate | 'contacts_qty' | 'deleted_at'

export type CreateWaAccountData = Omit<WaAccount, OmitOnCreate>
export type UpdateWaAccountData = Partial<Omit<WaAccount, OmitOnUpdate>>
