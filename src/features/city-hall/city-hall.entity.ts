import { ApiProperty } from '@nestjs/swagger'
import { CityHall } from '@prisma/client'

export class CityHallEntity implements CityHall {
  @ApiProperty()
  id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  phone!: string | null

  @ApiProperty()
  email!: string | null

  @ApiProperty()
  slug!: string

  @ApiProperty()
  txt_color!: string

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  @ApiProperty()
  deleted_at!: Date | null

  @ApiProperty()
  file?: Express.Multer.File
}
