import { BadRequestException, PipeTransform } from '@nestjs/common'
import { ZodError, ZodSchema, ZodType } from 'zod'

export type ZodObj<T extends Record<PropertyKey, unknown>> = {
  [key in keyof T]: ZodType<T[key]>
}

export class ZodValidationError extends BadRequestException {
  constructor(errors: ZodError['errors']) {
    const details = errors.map(({ path, ...rest }) => ({
      field: path.join('.'),
      ...rest,
    }))

    super({
      details,
      error: 'InputData',
      statusCode: 400,
    })
  }

  static example(field = 'name') {
    const errors: ZodError['errors'] = [
      {
        code: 'invalid_type',
        expected: 'string',
        message: 'Required',
        path: [field],
        received: 'undefined',
      },
    ]
    return new this(errors).getResponse()
  }
}

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    if (!value) return

    // If it is a file, return it without validation
    if (typeof value === 'object' && 'fieldname' in value) return value

    try {
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ZodValidationError(error.errors)
      }

      throw new BadRequestException('Validation failed')
    }
  }
}
