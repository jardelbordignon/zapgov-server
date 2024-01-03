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
  UsePipes,
  applyDecorators,
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { ZodObject, z } from 'zod'

import type { UpdateUserData } from 'src/contracts/account'
import {
  ZodObj,
  ZodValidationError,
  ZodValidationPipe,
} from 'src/infra/pipes/zod-validation.pipe'
import { CurrentUser } from 'src/infra/providers/auth/current-user.decorator'
import { omitObjectProperties } from 'src/infra/utils/omit-object-properties'

import { USERS_URL } from '../../shared/constants'
import { UserEntity } from '../../user.entity'
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
//         code: 'invalid_type',
//         expected: 'string',
//         message: 'currentPassword is required to update email or password',
//         path: ['currentPassword'],
//         received: typeof currentPassword,
//       })
//     }
//   })
// )

const createUserOpenApiSchema = generateSchema(updateUserZodObject)

function UpdateUserApiDecorators() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiBody({ schema: createUserOpenApiSchema as any }),
    ApiResponse({
      description: 'User updated successful',
      status: 200,
      type: UserEntity,
    }),
    ApiResponse({
      description: 'When the input data is invalid',
      schema: { example: ZodValidationError.example() },
      status: 400,
    }),
    ApiResponse({
      description:
        'When trying to edit email and/or password without correctly entering currentPassword,',
      schema: { example: new UnauthorizedToUpdateUserError() },
      status: 401,
    }),
    ApiResponse({
      description: 'When user not found',
      schema: { example: new UserNotFoundError() },
      status: 404,
    }),
    ApiResponse({
      description: 'When an user with same email address already exists',
      schema: { example: new UserAlreadyExistsError() },
      status: 409,
    }),
    UsePipes(new ZodValidationPipe(updateUserZodObject))
  )
}

@ApiTags('User')
@Controller(USERS_URL)
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
  ): Promise<UserEntity> {
    const result = await this.updateUserService.execute(userId, body)
    return this.handleResult(result)
  }

  @UpdateUserApiDecorators()
  @Put('/:userId')
  async handleUpdateByUserId(
    @CurrentUser('roles') loggedUserRoles: Role[],
    @Param('userId') userId: string,
    @Body() body: UpdateUserData
  ): Promise<UserEntity> {
    if (!loggedUserRoles?.includes('ADMIN')) {
      throw new UnauthorizedException('only admin users can edit other users')
    }
    const isAdmin = true
    const result = await this.updateUserService.execute(userId, body, isAdmin)
    return this.handleResult(result)
  }
}
