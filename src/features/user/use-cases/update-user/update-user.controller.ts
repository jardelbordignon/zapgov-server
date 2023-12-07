import { extendZodWithOpenApi, generateSchema } from '@anatine/zod-openapi'
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
  applyDecorators,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { ZodObject, z } from 'zod'

import type { UpdateUserData, UserOmittedPassword } from 'src/contracts/account'
import { CurrentUser } from 'src/infra/auth/current-user.decorator'
import { ZodObj } from 'src/infra/pipes/zod-validation.pipe'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../constants'
import {
  UnauthorizedToUpdateUserError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../errors'

import { UpdateUserService, UpdateUserServiceResponse } from './update-user.service'

type UpdateUserBodySchema = ZodObject<ZodObj<UpdateUserData>>

extendZodWithOpenApi(z)

const updateUserZodObject = z.object({
  currentPassword: z.string().optional().openapi({ example: 'Pwd@123' }),
  email: z.string().email().optional().openapi({ example: 'johndoe@email.com' }),
  name: z.string().optional().openapi({ example: 'Updated John Doe' }),
  password: z.string().optional().openapi({ example: 'UpdatedPwd@123' }),
  roles: z.array(z.nativeEnum(Role)).optional(),
}) as UpdateUserBodySchema

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

const createUserOpenApiSchema = generateSchema(updateUserZodObject)

function UpdateUserApiDecorators() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiBody({ schema: createUserOpenApiSchema as any }),
    ApiResponse({ description: 'User updated successful', status: 200 }),
    ApiResponse({
      description: `When an user with same email address already exists <br/>
        When trying to edit email and/or password without correctly entering currentPassword`,
      status: 401,
    }),
    ApiResponse({
      description: 'When user not found',
      status: 404,
    })
  )
}

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

  @UpdateUserApiDecorators()
  @Put()
  async handle(
    @CurrentUser('sub') userId: string,
    @Body() body: UpdateUserData
  ): Promise<UserOmittedPassword> {
    const result = await this.updateUserService.execute(userId, body)
    return this.handleResult(result)
  }

  @UpdateUserApiDecorators()
  @Put('/:userId')
  async handleUpdateByUserId(
    @CurrentUser('roles') loggedUserRoles: Role[],
    @Param('userId') userId: string,
    @Body() body: UpdateUserData
  ): Promise<UserOmittedPassword> {
    if (!loggedUserRoles?.includes('ADMIN')) {
      throw new UnauthorizedException('only admin users can edit other users')
    }
    const isAdmin = true
    const result = await this.updateUserService.execute(userId, body, isAdmin)
    return this.handleResult(result)
  }
}
