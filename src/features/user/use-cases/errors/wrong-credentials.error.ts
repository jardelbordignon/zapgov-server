export class WrongCredentialsError extends Error {
  constructor(message = 'Credentials are not valid.') {
    super(message)
  }
}
