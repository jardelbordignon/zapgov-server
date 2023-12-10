import { ConflictError } from 'src/infra/errors'

export class SubCityHallAlreadyExistsError extends ConflictError {
  constructor(
    message = 'Sub city hall with some@email.com email address already exists.'
  ) {
    super(message)
  }
}
