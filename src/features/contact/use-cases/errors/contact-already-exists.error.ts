import { ConflictError } from 'src/infra/errors'

export class ContactAlreadyExistsError extends ConflictError {
  constructor(message = 'Contact already exists.') {
    super(message)
  }
}
