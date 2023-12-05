import { Role } from '@prisma/client'

import type { UserPayload } from 'src/infra/auth/jwt-strategy'

import { InMemoryUserRepository } from '../../repositories/in-memory.user.repository'
import { UnauthorizedToDeleteAnAdminUserError, UserNotFoundError } from '../errors'

import { DeleteUserService } from './delete-user.service'

let userRepository: InMemoryUserRepository
let deleteUserService: DeleteUserService

let loggedJohnAdminData: UserPayload
const johnEmail = 'johndoe@email.com'
const joeEmail = 'joesmith@email.com'

describe('Update user', () => {
  beforeAll(async () => {
    userRepository = new InMemoryUserRepository()
    deleteUserService = new DeleteUserService(userRepository)
  })

  beforeEach(async () => {
    await userRepository.create({
      email: johnEmail,
      name: 'John Doe',
      password: 'Pwd@123',
    })
    const john = await userRepository.findByEmail(johnEmail)
    await userRepository.update(john!.id, { roles: [Role.ADMIN] })
    loggedJohnAdminData = { roles: john.roles, sub: john.id }

    await userRepository.create({
      email: joeEmail,
      name: 'Joe Smith',
      password: 'Pwd@123',
    })
  })

  afterEach(async () => {
    const users = await userRepository.findAll()
    for (const user of users) {
      await userRepository.delete(user.id)
    }
  })

  it('should be able to delete an user', async () => {
    const joe = await userRepository.findByEmail(joeEmail)
    const soft = false
    const result = await deleteUserService.execute(loggedJohnAdminData, joe.id, soft)

    expect(result.isSuccess()).toBe(true)
    const users = await userRepository.findAll()
    expect(users.length).toBe(1)
  })

  it('should be able to soft delete an user', async () => {
    const joe = await userRepository.findByEmail(joeEmail)
    const soft = true
    const result = await deleteUserService.execute(loggedJohnAdminData, joe.id, soft)

    expect(result.isSuccess()).toBe(true)
    const users = await userRepository.findAll()
    expect(users.length).toBe(1)
    const deletedUsers = await userRepository.findAllDeleted()
    expect(deletedUsers.length).toBe(1)
    expect(deletedUsers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ deleted_at: expect.any(Date), name: 'Joe Smith' }),
      ])
    )
  })

  it('should not be able to delete a not found user', async () => {
    const result = await deleteUserService.execute(
      loggedJohnAdminData,
      'invalid-user-id',
      false
    )
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('it should not be able to delete my account from being an admin', async () => {
    const john = await userRepository.findByEmail(johnEmail)

    const result = await deleteUserService.execute(
      loggedJohnAdminData,
      john!.id,
      false
    )
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedToDeleteAnAdminUserError)
  })

  it('should not be able to delete an admin user', async () => {
    const joe = await userRepository.findByEmail(joeEmail)
    await userRepository.update(joe!.id, { roles: [Role.ADMIN] })

    const result = await deleteUserService.execute(
      loggedJohnAdminData,
      joe!.id,
      false
    )
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedToDeleteAnAdminUserError)
  })
})
