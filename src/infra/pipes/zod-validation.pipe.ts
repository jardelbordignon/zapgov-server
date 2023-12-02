import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodSchema, ZodType } from 'zod'
import { fromZodError } from 'zod-validation-error'

export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: ZodType<T[key]>
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          errors: fromZodError(error),
          message: 'Validation failed',
          statusCode: 400,
        })
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
