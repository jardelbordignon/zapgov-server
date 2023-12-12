export class ForbiddenError {
  statusCode: number
  error: string
  message: string

  constructor(message: string, error = 'Forbidden', statusCode = 403) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
