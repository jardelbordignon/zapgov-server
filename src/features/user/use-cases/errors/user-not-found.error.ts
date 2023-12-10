import { NotFoundError } from 'src/infra/errors'

export class UserNotFoundError extends NotFoundError {
  constructor(message = 'User not found.') {
    super(message)
  }
}
