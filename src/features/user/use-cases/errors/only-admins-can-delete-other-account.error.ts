export class OnlyAdminsCanDeleteOtherAccount extends Error {
  constructor(message = 'Only admins can delete other account.') {
    super(message)
  }
}
