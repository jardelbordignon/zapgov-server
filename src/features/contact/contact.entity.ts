import { ApiProperty } from '@nestjs/swagger'
import { Contact } from '@prisma/client'

export class ContactEntity implements Contact {
  @ApiProperty()
  id!: string

  @ApiProperty()
  wa_account_id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  gender!: string

  @ApiProperty()
  phone!: string

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  @ApiProperty()
  deleted_at!: Date | null
}
