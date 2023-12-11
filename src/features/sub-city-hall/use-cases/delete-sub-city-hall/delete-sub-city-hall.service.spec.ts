import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../constants'
import { SubCityHallNotFoundError } from '../errors'

import { DeleteSubCityHallService } from './delete-sub-city-hall.service'

let subSubCityHallRepository: SubCityHallRepository
let deleteSubCityHallService: DeleteSubCityHallService

describe('Delete city hall', () => {
  beforeAll(async () => {
    subSubCityHallRepository = new InMemorySubCityHallRepository()
    deleteSubCityHallService = new DeleteSubCityHallService(subSubCityHallRepository)
  })

  beforeEach(async () => {
    await subSubCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)
  })

  afterEach(async () => {
    const getSubCityHalls = await subSubCityHallRepository.findAll({
      page: 1,
      perPage: 100,
    })
    for (const subSubCityHall of getSubCityHalls.data) {
      await subSubCityHallRepository.delete(subSubCityHall.id)
    }
  })

  it('should be able to delete a sub city hall', async () => {
    const defaultSubCityHall = await subSubCityHallRepository.findByEmail(
      CREATE_SUB_CITY_HALL_DATA.email
    )
    const soft = false
    const result = await deleteSubCityHallService.execute(defaultSubCityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getSubCityHalls = await subSubCityHallRepository.findAll({
      page: 1,
      perPage: 100,
    })
    expect(getSubCityHalls.data.length).toBe(0)
  })

  it('should be able to soft delete a sub city hall', async () => {
    const defaultSubCityHall = await subSubCityHallRepository.findByEmail(
      CREATE_SUB_CITY_HALL_DATA.email
    )
    const soft = true
    const result = await deleteSubCityHallService.execute(defaultSubCityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getSubCityHalls = await subSubCityHallRepository.findAll({
      page: 1,
      perPage: 100,
    })
    expect(getSubCityHalls.data.length).toBe(0)

    const getDeletedSubCityHalls = await subSubCityHallRepository.findAllDeleted({
      page: 1,
      perPage: 100,
    })
    expect(getDeletedSubCityHalls.data.length).toBe(1)
    expect(getDeletedSubCityHalls.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...CREATE_SUB_CITY_HALL_DATA,
          deleted_at: expect.any(Date),
        }),
      ])
    )
  })

  it('should not be able to delete a non-existent city hall', async () => {
    const soft = false
    const result = await deleteSubCityHallService.execute(
      'non-existent-sub-city-hall-id',
      soft
    )

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(SubCityHallNotFoundError)
  })
})
