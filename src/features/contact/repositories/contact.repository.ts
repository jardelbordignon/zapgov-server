import { Contact } from '@prisma/client'

import { CreateContactData } from 'src/contracts/contacts'
import { PaginatedResponse, PaginationParams } from 'src/infra/providers/pagination'

export abstract class ContactRepository {
  abstract create(data: CreateContactData): Promise<Contact>
  abstract delete(id: string): Promise<void>
  abstract findByPhone(phone: string): Promise<Contact | null>
  abstract findById(id: string): Promise<Contact | null>
  abstract findAll(params?: PaginationParams): Promise<PaginatedResponse<Contact>>
  //abstract update(id: string, data: UpdateContactData): Promise<Contact>
}
