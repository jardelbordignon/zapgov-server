export class UserAlreadyExistsError extends Error {
  constructor(message = 'User already exists.') {
    super(message)
  }
}
