import { ConflictError } from 'src/infra/errors'

export class CityHallAlreadyExistsError extends ConflictError {
  constructor(
    message = 'City hall with some@email.com email address already exists.'
  ) {
    super(message)
  }
}
