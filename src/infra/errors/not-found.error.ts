export class NotFoundError {
  statusCode: number
  error: string
  message: string

  constructor(message: string, error = 'NotFound', statusCode = 404) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
