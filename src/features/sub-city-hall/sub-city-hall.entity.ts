import { ApiProperty } from '@nestjs/swagger'
import { SubCityHall } from '@prisma/client'

export class SubCityHallEntity implements SubCityHall {
  @ApiProperty()
  id!: string

  @ApiProperty()
  city_hall_id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  phone!: string | null

  @ApiProperty()
  email!: string | null

  @ApiProperty()
  observation!: string | null

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  @ApiProperty()
  deleted_at!: Date | null
}
