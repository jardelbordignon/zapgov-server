import { NotFoundError } from 'src/infra/errors'

export class WaAccountNotFoundError extends NotFoundError {
  constructor(message = 'Whatsapp account not found.') {
    super(message)
  }
}
