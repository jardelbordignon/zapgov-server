import { InMemoryUserRepository } from 'src/features/user/repositories/in-memory.user.repository'
import { FakeEncrypter } from 'src/infra/providers/cryptography/encrypter/fake-encrypter'
import { FakeHasher } from 'src/infra/providers/cryptography/hasher/fake-hasher'
import { I18n } from 'src/infra/providers/i18n/i18n'

import { WrongCredentialsError } from '../errors'

import { AuthUserService } from './auth-user.service'

let userRepository: InMemoryUserRepository
let hasher: FakeHasher
let encrypter: FakeEncrypter
let i18n: I18n
let authUserService: AuthUserService

let hashedPassword: string
const password = 'Pwd@123'
const email = 'johndoe@email.com'

describe('Authenticate user', () => {
  beforeAll(async () => {
    userRepository = new InMemoryUserRepository()
    hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    i18n = new I18n()

    authUserService = new AuthUserService(userRepository, hasher, encrypter, i18n)

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

  it('should be able to authenticate an user', async () => {
    const result = await authUserService.execute({ email, password })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      isAdmin: expect.any(Boolean),
    })
  })

  it('should not be able to authenticate an user with a invalid email', async () => {
    const result = await authUserService.execute({
      email: 'invalid.address@email.com',
      password,
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not be able to authenticate an user with a invalid password', async () => {
    const result = await authUserService.execute({
      email,
      password: 'invalid.password',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
