export class UnauthorizedToDeleteAnAdminUserError extends Error {
  constructor(message = 'Unauthorized to delete an admin user.') {
    super(message)
  }
}
