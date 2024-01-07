import type { Contact } from '@prisma/client'

type OmitOnUpdate = 'id' | 'created_at' | 'updated_at'
type OmitOnCreate = OmitOnUpdate | 'deleted_at'

export type CreateContactData = Omit<Contact, OmitOnCreate>
export type CreateContactInputData = Omit<Contact, OmitOnCreate | 'wa_account_id'> & {
  city_hall_id: string
}
