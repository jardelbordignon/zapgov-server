import { slugify } from 'src/infra/utils/text-formatters'

import { InMemoryCityHallRepository } from '../../repositories/in-memory.city-hall.repository'

import { ListCityHallsService } from './list-city-halls.service'

let repository: InMemoryCityHallRepository
let service: ListCityHallsService

const cityNames = ['Tangamandapio', 'Acapulco', 'Ciudad de México']

describe('List city-halls', () => {
  beforeAll(async () => {
    repository = new InMemoryCityHallRepository()
    service = new ListCityHallsService(repository)

    for (const cityName of cityNames) {
      await repository.create({
        email: `${slugify(cityName)}@email.com`,
        name: cityName,
        phone: `01 (744) 440 700${cityName.length}`,
        slug: slugify(cityName),
        txt_color: '#000000',
      })
    }
  })

  it('should be able to list the city-halls', async () => {
    const result = await service.execute()

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(cityNames.length)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Tangamandapio' }),
        expect.objectContaining({ name: 'Acapulco' }),
        expect.objectContaining({
          name: 'Ciudad de México',
          slug: 'ciudad-de-mexico',
        }),
      ])
    )
  })

  it('should be able to list the filtered city-halls', async () => {
    const result = await service.execute({ filter: 'email,name,slug=u' })

    expect(result.isSuccess()).toBe(true)
    expect(result.value?.data.length).toBe(2)
    expect(result.value?.data).toEqual(
      expect.arrayContaining([
        //expect.objectContaining({ name: 'Tangamandapio' }),
        expect.objectContaining({ name: 'Acapulco' }),
        expect.objectContaining({ name: 'Ciudad de México' }),
      ])
    )
  })
})
