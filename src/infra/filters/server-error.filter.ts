/* eslint-disable sort-keys-fix/sort-keys-fix */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class ServerErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()

    if (exception instanceof HttpException) {
      // just continues
      response.status(exception.getStatus()).json(exception.getResponse())
    } else {
      const responseObject = {
        error: 'InternalServerError',
        statusCode: 500,
        message: exception.message,
        endpoint: request.url,
      }

      if (process.env.NODE_ENV !== 'production') {
        console.error(exception)
        Object.assign(responseObject, {
          stack: exception.stack?.replaceAll('    ', '').split('\n').reverse(),
        })
      }

      response.status(500).json(responseObject)
    }
  }
}
