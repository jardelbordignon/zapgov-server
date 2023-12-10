import { NotFoundError } from 'src/infra/errors'

export class CityHallNotFoundError extends NotFoundError {
  constructor(message = 'City hall not found.') {
    super(message)
  }
}
