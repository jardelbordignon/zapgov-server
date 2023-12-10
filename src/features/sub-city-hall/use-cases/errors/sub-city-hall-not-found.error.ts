export class SubCityHallNotFoundError extends Error {
  constructor(message = 'Sub city hall not found.') {
    super(message)
  }
}
