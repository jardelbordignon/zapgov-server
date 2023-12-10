import { UnauthorizedError } from 'src/infra/errors'

export class UnauthorizedToDeleteAnAdminUserError extends UnauthorizedError {
  constructor(message = 'Unauthorized to delete an admin user.') {
    super(message)
  }
}
