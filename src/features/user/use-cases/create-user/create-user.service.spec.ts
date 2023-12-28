import { FakeHasher } from 'src/infra/providers/cryptography/hasher/fake-hasher'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemoryUserRepository } from '../../repositories/in-memory.user.repository'
import { UserAlreadyExistsError } from '../errors'

import { CreateUserService } from './create-user.service'

let userRepository: InMemoryUserRepository
let hasher: FakeHasher
let i18n: I18n
let createUserService: CreateUserService

let hashedPassword: string
const password = 'Pwd@123'
const email = 'johndoe@email.com'

describe('Create user', () => {
  beforeAll(async () => {
    userRepository = new InMemoryUserRepository()
    hasher = new FakeHasher()
    i18n = new I18n()
    createUserService = new CreateUserService(userRepository, hasher, i18n)

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
    const getUsers = await userRepository.findAll({ page: 1, perPage: 10 })
    for (const user of getUsers.data) {
      await userRepository.delete(user.id)
    }
  })

  it('should be able to create a new user', async () => {
    const email = 'joesmith@email.com'
    const name = 'Joe Smith'

    const result = await createUserService.execute({ email, name, password })
    expect(result.isSuccess()).toBe(true)
    const createdUser = await userRepository.findByEmail(email)
    expect(createdUser?.name).toBe(name)
    const getUsers = await userRepository.findAll({ page: 1, perPage: 10 })
    expect(getUsers.data.length).toBe(2)
  })

  it('should be able to create a new admin user', async () => {
    const email = 'joesmith@email.com'
    const name = 'Joe Smith'

    const result = await createUserService.execute({
      email,
      name,
      password,
      roles: ['ADMIN'],
    })
    expect(result.isSuccess()).toBe(true)
    const createdUser = await userRepository.findByEmail(email)
    expect(createdUser).toEqual(
      expect.objectContaining({ name: 'Joe Smith', roles: ['ADMIN'] })
    )
  })

  it('should not be able to create a new user with an email already in use', async () => {
    const result = await createUserService.execute({ email, name: 'John', password })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
