import { ApiProperty } from '@nestjs/swagger'
import { Role, User } from '@prisma/client'

export class UserEntity implements Omit<User, 'password'> {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  email: string

  @ApiProperty()
  roles: Role[]

  @ApiProperty()
  created_at: Date

  @ApiProperty()
  updated_at: Date

  @ApiProperty()
  deleted_at: Date
}
