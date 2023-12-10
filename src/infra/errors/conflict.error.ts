export class ConflictError {
  statusCode: number
  error: string
  message: string

  constructor(message: string, error = 'Conflict', statusCode = 409) {
    this.error = error
    this.message = message
    this.statusCode = statusCode
  }
}
