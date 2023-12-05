import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
  //  UsePipes,
} from '@nestjs/common'
import { Role } from '@prisma/client'
// import { ZodObject, z } from 'zod'

import type { UpdateUserData, UserOmittedPassword } from 'src/contracts/account'
import { CurrentUser } from 'src/infra/auth/current-user.decorator'
// import { ZodObj, ZodValidationPipe } from 'src/infra/pipes/zod-validation.pipe'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../constants'
import {
  UnauthorizedToUpdateUserError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../errors'

import { UpdateUserService, UpdateUserServiceResponse } from './update-user.service'

// type UpdateUserBodySchema = ZodObject<ZodObj<UpdateUserData>>

// const updateUserZodObject = z.object({
//   currentPassword: z.string().optional(),
//   email: z.string().email().optional(),
//   name: z.string().optional(),
//   password: z.string().optional(),
//   roles: z.array(z.nativeEnum(Role)).optional(),
// }) as UpdateUserBodySchema

// const updateUserValidationPipe = new ZodValidationPipe(
//   updateUserZodObject.superRefine(({ currentPassword, email, password }, ctx) => {
//     if ((email || password) && !currentPassword) {
//       ctx.addIssue({
//         code: 'custom',
//         message: 'currentPassword if required to update email or password',
//         path: ['currentPassword'],
//       })
//     }
//   })
// )

@Controller(USERS_URL)
//@UsePipes(updateUserValidationPipe)
export class UpdateUserController {
  constructor(private updateUserService: UpdateUserService) {}

  handleResult(result: UpdateUserServiceResponse) {
    if (result.isFailure()) {
      const error = result.value

      switch (error.constructor) {
        case UserNotFoundError:
          throw new NotFoundException(error.message)
        case UnauthorizedToUpdateUserError:
          throw new UnauthorizedException(error.message)
        case UserAlreadyExistsError:
          throw new ConflictException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return omitObjectProperties(result.value, ['password'])
  }

  @Put()
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() body: UpdateUserData
  ): Promise<UserOmittedPassword> {
    const result = await this.updateUserService.execute(userId, body)
    return this.handleResult(result)
  }

  @Put('/:userId')
  async handleUpdateByUserId(
    @CurrentUser('roles') loggedUserRoles: Role[],
    @Param('userId') userId: string,
    @Body() body: UpdateUserData
  ): Promise<UserOmittedPassword> {
    if (!loggedUserRoles?.includes('ADMIN')) {
      throw new UnauthorizedException('only admin users can edit other users')
    }
    const result = await this.updateUserService.execute(userId, body)
    return this.handleResult(result)
  }
}
