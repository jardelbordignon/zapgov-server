import { NotFoundError } from 'src/infra/errors'

export class SubCityHallNotFoundError extends NotFoundError {
  constructor(message = 'Sub city hall not found.') {
    super(message)
  }
}
