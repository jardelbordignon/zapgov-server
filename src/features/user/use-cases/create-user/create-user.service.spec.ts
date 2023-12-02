import { FakeHasher } from 'src/infra/cryptography/hasher/fake-hasher'

import { InMemoryUserRepository } from '../../repositories/in-memory.user.repository'
import { UserAlreadyExistsError } from '../errors'

import { CreateUserService } from './create-user.service'

let userRepository: InMemoryUserRepository
let hasher: FakeHasher
let createUserService: CreateUserService

let hashedPassword: string
const password = 'Pwd@123'
const email = 'johndoe@email.com'

describe('Create user', () => {
  beforeAll(async () => {
    userRepository = new InMemoryUserRepository()
    hasher = new FakeHasher()
    createUserService = new CreateUserService(userRepository, hasher)

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
    const users = await userRepository.findAll()
    for (const user of users) {
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
    const users = await userRepository.findAll()
    expect(users.length).toBe(2)
  })

  it('should not be able to create a new user with an email already in use', async () => {
    const result = await createUserService.execute({ email, name: 'John', password })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserAlreadyExistsError)
  })
})
