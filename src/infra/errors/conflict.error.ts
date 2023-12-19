export class ConflictError {
  message: string
  error: string
  statusCode: number

  constructor(message: string, error = 'Conflict', statusCode = 409) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
