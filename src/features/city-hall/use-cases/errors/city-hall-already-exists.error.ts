export class CityHallAlreadyExistsError extends Error {
  constructor(message = 'City hall already exists.') {
    super(message)
  }
}
