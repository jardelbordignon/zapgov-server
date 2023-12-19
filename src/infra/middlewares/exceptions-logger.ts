// exceptionsLogger.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class ExceptionsLogger implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status = exception.getStatus ? exception.getStatus() : 500

    const error = exception.message.split('\n')

    response.status(status).json({
      error,
      path: request.url,
      statusCode: status,
      timestamp: new Date().toISOString(),
    })
  }
}
