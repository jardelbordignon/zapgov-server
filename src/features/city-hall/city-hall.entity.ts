import { ApiProperty } from '@nestjs/swagger'
import { CityHall } from '@prisma/client'

export class CityHallEntity implements CityHall {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  phone: string

  @ApiProperty()
  email: string

  @ApiProperty()
  slug: string

  @ApiProperty()
  txt_color: string

  @ApiProperty()
  bg_image: string

  @ApiProperty()
  created_at: Date

  @ApiProperty()
  updated_at: Date

  @ApiProperty()
  deleted_at: Date
}
