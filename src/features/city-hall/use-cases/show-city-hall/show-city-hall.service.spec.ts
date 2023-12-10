import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from '../constants'
import { CityHallNotFoundError } from '../errors'

import { ShowCityHallService } from './show-city-hall.service'

let repository: InMemoryCityHallRepository
let showCityHallService: ShowCityHallService

describe('Show city hall', () => {
  beforeAll(async () => {
    repository = new InMemoryCityHallRepository()
    showCityHallService = new ShowCityHallService(repository)

    await repository.create(CREATE_CITY_HALL_DATA)
  })

  it('should be able to show a city hall', async () => {
    const { id } = await repository.findByEmail(CREATE_CITY_HALL_DATA.email)
    const result = await showCityHallService.execute(id)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(
      expect.objectContaining({
        ...CREATE_CITY_HALL_DATA,
        id: expect.any(String),
      })
    )
  })

  it('should not be able to show a nonexistent user', async () => {
    const result = await showCityHallService.execute('invalid-user-id')
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })
})
