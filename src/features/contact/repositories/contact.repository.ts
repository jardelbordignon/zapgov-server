import { Contact } from '@prisma/client'

import { CreateContactData } from 'src/contracts/contacts'
import { ListParams, ListResponse } from 'src/infra/providers/list'

export abstract class ContactRepository {
  abstract create(data: CreateContactData): Promise<Contact>
  abstract delete(id: string): Promise<void>
  abstract findByPhone(phone: string): Promise<Contact | null>
  abstract findById(id: string): Promise<Contact | null>
  abstract findAll(params?: ListParams): Promise<ListResponse<Contact>>
  //abstract update(id: string, data: UpdateContactData): Promise<Contact>
}
