import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'
import { CREATE_CITY_HALL_DATA } from '../constants'
import { CityHallAlreadyExistsError, CityHallNotFoundError } from '../errors'

import { UpdateCityHallService } from './update-city-hall.service'

let repository: InMemoryCityHallRepository
let updateCityHallService: UpdateCityHallService

describe('Update user', () => {
  beforeAll(async () => {
    repository = new InMemoryCityHallRepository()
    updateCityHallService = new UpdateCityHallService(repository)
  })

  beforeEach(async () => {
    await repository.create(CREATE_CITY_HALL_DATA)
  })

  afterEach(async () => {
    const getItems = await repository.findAll({ page: 1, perPage: 100 })
    for (const item of getItems.data) {
      console.log(item.id)
      //await repository.delete(item.id)
    }
  })

  it('should be able to update a city hall', async () => {
    const item = await repository.findByEmail(CREATE_CITY_HALL_DATA.email)
    const name = `Updated ${CREATE_CITY_HALL_DATA.name}`
    const result = await updateCityHallService.execute(item!.id, { name })
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toEqual(expect.objectContaining({ name }))
  })

  it('should not be able to update a nonexistent city hall', async () => {
    const result = await updateCityHallService.execute('nonexistent-id', {
      name: 'name',
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallNotFoundError)
  })

  it('should not be able to update the email using an address already in use', async () => {
    const acapulcoEmailAddress = 'acapulco@email.com'

    await repository.create({
      ...CREATE_CITY_HALL_DATA,
      email: acapulcoEmailAddress,
      name: 'Acapulco',
      slug: 'acapulco',
    })

    const newItem = await repository.findByEmail(acapulcoEmailAddress)

    const result = await updateCityHallService.execute(newItem!.id, {
      email: CREATE_CITY_HALL_DATA.email,
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
  })

  it('should not be able to update the slug using one already in use', async () => {
    const acapulcoEmailAddress = 'acapulco@email.com'

    await repository.create({
      ...CREATE_CITY_HALL_DATA,
      email: acapulcoEmailAddress,
      name: 'Acapulco',
      slug: 'acapulco',
    })

    const newItem = await repository.findByEmail(acapulcoEmailAddress)

    const result = await updateCityHallService.execute(newItem!.id, {
      slug: CREATE_CITY_HALL_DATA.slug,
    })
    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(CityHallAlreadyExistsError)
  })
})
