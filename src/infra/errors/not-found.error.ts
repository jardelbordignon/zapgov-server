export class NotFoundError {
  message: string
  error: string
  statusCode: number

  constructor(message: string, error = 'NotFound', statusCode = 404) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
