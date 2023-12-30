import { ConflictError } from 'src/infra/errors'

export class WaAccountAlreadyExistsError extends ConflictError {
  constructor(
    message = 'Whatsapp account with 51999999 phone number already exists.'
  ) {
    super(message)
  }
}
