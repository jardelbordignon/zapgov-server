export class UnauthorizedToUpdateUserError extends Error {
  constructor(message = 'Unauthorized to update user.') {
    super(message)
  }
}
