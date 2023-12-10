export class UnauthorizedError {
  statusCode: number
  error: string
  message: string

  constructor(message: string, error = 'Unauthorized', statusCode = 401) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
