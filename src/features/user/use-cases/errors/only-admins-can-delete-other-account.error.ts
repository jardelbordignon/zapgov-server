import { UnauthorizedError } from 'src/infra/errors'

export class OnlyAdminsCanDeleteOtherAccount extends UnauthorizedError {
  constructor(message = 'Only admins can delete other account.') {
    super(message)
  }
}
