import { NotFoundError } from 'src/infra/errors'

export class ContactNotFoundError extends NotFoundError {
  constructor(message = 'Contact not found.') {
    super(message)
  }
}
