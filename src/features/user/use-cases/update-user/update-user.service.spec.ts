import { FakeHasher } from 'src/infra/cryptography/hasher/fake-hasher'

import { InMemoryUserRepository } from '../../repositories/in-memory.user.repository'
import {
  UnauthorizedToUpdateUserError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from '../errors'

import { UpdateUserService } from './update-user.service'

let userRepository: InMemoryUserRepository
let hasher: FakeHasher
let updateUserService: UpdateUserService

let hashedPassword: string
const password = 'Pwd@123'
const email = 'johndoe@email.com'

describe('Update user', () => {
  beforeAll(async () => {
    userRepository = new InMemoryUserRepository()
    hasher = new FakeHasher()
    updateUserService = new UpdateUserService(userRepository, hasher)

    hashedPassword = await hasher.hash(password)
  })

  beforeEach(async () => {
    await userRepository.create({
      email,
      name: 'John Doe',
      password: hashedPassword,
    })
  })

  afterEach(async () => {
    const getUsers = await userRepository.findAll({ page: 1, perPage: 100 })
    for (const user of getUsers.data) {
      await userRepository.delete(user.id)
    }
  })

  it('should be able to update an user', async () => {
    const user = await userRepository.findByEmail(email)
    const name = 'John Doe Updated'
    const result = await updateUserService.execute(user!.id, { name })
    expect(result.isSuccess()).toBe(true)
    expect(result.value.name).toBe(name)
  })

  it('should be able to update email and/or password by correctly entering the current password', async () => {
    const user = await userRepository.findByEmail(email)
    const newEmail = 'new-address@email.com'
    const newPassword = 'NewPwd@123'

    const result = await updateUserService.execute(user!.id, {
      currentPassword: password,
      email: newEmail,
      password: newPassword,
    })

    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        email: newEmail,
        password: await hasher.hash(newPassword),
      })
    )
  })

  it('should not be able to update a nonexistent user', async () => {
    const result = await updateUserService.execute('nonexistent-id', { name: 'name' })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })

  it('should not be able to update email and/or password without inform the current password', async () => {
    const user = await userRepository.findByEmail(email)
    const result = await updateUserService.execute(user!.id, { password: 'new-pwd' })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedToUpdateUserError)
  })

  it('should not be able to update email and/or password without inform the correctly current password', async () => {
    const user = await userRepository.findByEmail(email)
    const result = await updateUserService.execute(user!.id, {
      currentPassword: 'wrongCurrentPassword',
      password: 'new-pwd',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UnauthorizedToUpdateUserError)
  })

  it('should not be able to update email using an address already in use', async () => {
    const joeEmailAddress = 'joe.smith@email.com'

    await userRepository.create({
      email: joeEmailAddress,
      name: 'Joe Smith',
      password: hashedPassword,
    })

    const joe = await userRepository.findByEmail(joeEmailAddress)

    const result = await updateUserService.execute(joe!.id, {
      currentPassword: password,
      email,
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
