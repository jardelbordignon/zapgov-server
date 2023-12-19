export class UnauthorizedError {
  message: string
  error: string
  statusCode: number

  constructor(message: string, error = 'Unauthorized', statusCode = 401) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
