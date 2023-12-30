import { ApiProperty } from '@nestjs/swagger'
import type { WaAccount } from '@prisma/client'

export class WaAccountEntity implements WaAccount {
  @ApiProperty()
  id!: string

  @ApiProperty()
  city_hall_id!: string

  @ApiProperty()
  acronym!: string

  @ApiProperty()
  phone!: string

  @ApiProperty()
  contacts_qty: number = 0

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  @ApiProperty()
  deleted_at!: Date | null
}
