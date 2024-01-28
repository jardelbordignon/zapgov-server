import { InMemoryUserRepository } from '../../repositories/in-memory.user.repository'

import { ListUsersService } from './list-users.service'

let userRepository: InMemoryUserRepository
let listUsersService: ListUsersService

const names = ['John', 'Joe', 'James']

describe('List users', () => {
  beforeAll(async () => {
    userRepository = new InMemoryUserRepository()
    listUsersService = new ListUsersService(userRepository)

    for (const name of names) {
      await userRepository.create({
        email: `${name.toLocaleLowerCase()}@email.com`,
        name,
        password: 'Pwd@123',
      })
    }
  })

  it('should be able to list the users', async () => {
    const result = await listUsersService.execute({ deleted: 'no' })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(names.length)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John' }),
        expect.objectContaining({ name: 'Joe' }),
        expect.objectContaining({ name: 'James' }),
      ])
    )
  })

  it('should be able to list the ordered users', async () => {
    let result = await listUsersService.execute({ order: 'name', perPage: '1' })

    expect(result.value?.data.length).toBe(1)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'James' })])
    )

    result = await listUsersService.execute({ order: 'name.desc', perPage: '1' })

    expect(result.value?.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'John' })])
    )
  })

  it('should be able to list the filtered users', async () => {
    const result = await listUsersService.execute({ filter: 'name:jo,email:jo' })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(2)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'John' }),
        expect.objectContaining({ name: 'Joe' }),
      ])
    )
  })
})
