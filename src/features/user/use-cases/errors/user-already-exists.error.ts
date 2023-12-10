import { ConflictError } from 'src/infra/errors'

export class UserAlreadyExistsError extends ConflictError {
  constructor(message = 'User with some@email.com email address already exists.') {
    super(message)
  }
}
