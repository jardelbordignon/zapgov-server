import { ConflictError } from 'src/infra/errors'

export class NeighborhoodAlreadyExistsError extends ConflictError {
  constructor(
    message = 'Neighborhood with ABC name already exists in the sub city hall.'
  ) {
    super(message)
  }
}
