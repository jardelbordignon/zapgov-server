import { ApiProperty } from '@nestjs/swagger'
import { Neighborhood } from '@prisma/client'

export class NeighborhoodEntity implements Neighborhood {
  @ApiProperty()
  id!: string

  @ApiProperty()
  city_hall_id!: string

  @ApiProperty()
  sub_city_hall_id!: string

  @ApiProperty()
  name!: string

  @ApiProperty()
  cep!: string

  @ApiProperty()
  locality!: string | null

  @ApiProperty()
  observation!: string | null

  @ApiProperty()
  created_at!: Date

  @ApiProperty()
  updated_at!: Date

  @ApiProperty()
  deleted_at!: Date | null
}
