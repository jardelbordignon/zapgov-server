import { UnauthorizedError } from 'src/infra/errors'

export class WrongCredentialsError extends UnauthorizedError {
  constructor(message = 'Credentials are not valid.') {
    super(message)
  }
}
