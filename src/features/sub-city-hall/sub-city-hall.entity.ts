import { ApiProperty } from '@nestjs/swagger'
import { SubCityHall } from '@prisma/client'

export class SubCityHallEntity implements SubCityHall {
  @ApiProperty()
  id: string

  @ApiProperty()
  city_hall_id: string
  name: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  email: string

  @ApiProperty()
  observation: string

  @ApiProperty()
  created_at: Date

  @ApiProperty()
  updated_at: Date

  @ApiProperty()
  deleted_at: Date
}
