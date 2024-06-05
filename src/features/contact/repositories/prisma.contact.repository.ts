import type { Contact } from '@prisma/client'

import { CreateContactData } from 'src/contracts/contacts'
import { ListParams, ListResponse, prismaList } from 'src/infra/providers/list'
import { PrismaService } from 'src/infra/providers/prisma/prisma.service'

import { ContactRepository } from './contact.repository'

export class PrismaContactRepository
  extends PrismaService
  implements ContactRepository
{
  async create(data: CreateContactData): Promise<Contact> {
    const { birth_date, gender, name, phone, wa_account_id } = data
    return this.contact.create({
      data: { birth_date, gender, name, phone, wa_account_id },
    })
  }

  async delete(id: string): Promise<void> {
    await this.contact.delete({ where: { id } })
  }

  async findByPhone(phone: string): Promise<Contact | null> {
    return this.contact.findUnique({ where: { phone } })
  }

  async findById(id: string): Promise<Contact | null> {
    return this.contact.findFirst({ where: { id } })
  }

  async findAll(params?: ListParams): Promise<ListResponse<Contact>> {
    return prismaList(this.contact, params)
  }

  // async update(id: string, data: UpdateContactData): Promise<Contact> {
  //   const { gender, name, phone, wa_account_id } = data
  //   return this.contact.update({
  //     data: { gender, name, phone, wa_account_id },
  //     where: { id },
  //   })
  // }
}
