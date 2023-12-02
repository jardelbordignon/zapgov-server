import { InMemoryUserRepository } from '../../repositories/in-memory.user.repository'
import { UserNotFoundError } from '../errors'

import { ShowUserService } from './show-user.service'

let userRepository: InMemoryUserRepository
let showUserService: ShowUserService

const email = 'johndoe@email.com'

describe('Show user', () => {
  beforeAll(() => {
    userRepository = new InMemoryUserRepository()
    showUserService = new ShowUserService(userRepository)
  })

  beforeEach(async () => {
    await userRepository.create({
      email,
      name: 'John Doe',
      password: 'Pwd@123',
    })
  })

  afterEach(async () => {
    const users = await userRepository.findAll()
    for (const user of users) {
      await userRepository.delete(user.id)
    }
  })

  it('should be able to show an user', async () => {
    const user = await userRepository.findByEmail(email)
    const result = await showUserService.execute(user!.id)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        email,
        id: expect.any(String),
      })
    )
  })

  it('should not be able to show a nonexistent user', async () => {
    const result = await showUserService.execute('invalid-user-id')
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(UserNotFoundError)
  })
})
