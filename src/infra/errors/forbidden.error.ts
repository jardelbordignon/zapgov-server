export class ForbiddenError {
  message: string
  error: string
  statusCode: number

  constructor(message: string, error = 'Forbidden', statusCode = 403) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
