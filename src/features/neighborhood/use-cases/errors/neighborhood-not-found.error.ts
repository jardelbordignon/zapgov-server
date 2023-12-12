import { NotFoundError } from 'src/infra/errors'

export class NeighborhoodNotFoundError extends NotFoundError {
  constructor(message = 'Neighborhood not found.') {
    super(message)
  }
}
