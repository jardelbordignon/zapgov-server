import { UnauthorizedError } from 'src/infra/errors'

export class UnauthorizedToUpdateUserError extends UnauthorizedError {
  constructor(message = 'Unauthorized to update user.') {
    super(message)
  }
}
