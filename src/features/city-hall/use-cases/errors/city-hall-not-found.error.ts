export class CityHallNotFoundError extends Error {
  constructor(message = 'City hall not found.') {
    super(message)
  }
}
