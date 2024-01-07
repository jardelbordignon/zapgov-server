import { I18n } from 'src/infra/providers/i18n/i18n'

import { InMemorySubCityHallRepository } from '../../repositories/in-memory.sub-city-hall.repository'
import { SubCityHallRepository } from '../../repositories/sub-city-hall.repository'
import { CREATE_SUB_CITY_HALL_DATA } from '../../shared/test-helper'
import { SubCityHallEntity } from '../../sub-city-hall.entity'
import { SubCityHallNotFoundError } from '../errors'

import { DeleteSubCityHallService } from './delete-sub-city-hall.service'

let subSubCityHallRepository: SubCityHallRepository
let i18n: I18n
let deleteSubCityHallService: DeleteSubCityHallService
let subCityHall: SubCityHallEntity

describe('Delete city hall', () => {
  beforeAll(async () => {
    subSubCityHallRepository = new InMemorySubCityHallRepository()
    i18n = new I18n()
    deleteSubCityHallService = new DeleteSubCityHallService(
      subSubCityHallRepository,
      i18n
    )
  })

  beforeEach(async () => {
    subCityHall = await subSubCityHallRepository.create(CREATE_SUB_CITY_HALL_DATA)
  })

  afterEach(async () => {
    const getSubCityHalls = await subSubCityHallRepository.findAll()
    for (const subSubCityHall of getSubCityHalls.data) {
      await subSubCityHallRepository.delete(subSubCityHall.id)
    }
  })

  it('should be able to delete a sub city hall', async () => {
    const soft = false
    const result = await deleteSubCityHallService.execute(subCityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getSubCityHalls = await subSubCityHallRepository.findAll()
    expect(getSubCityHalls.data.length).toBe(0)
  })

  it('should be able to soft delete a sub city hall', async () => {
    const soft = true
    const result = await deleteSubCityHallService.execute(subCityHall.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getSubCityHalls = await subSubCityHallRepository.findAll({ deleted: 'no' })
    expect(getSubCityHalls.data.length).toBe(0)

    const getDeletedSubCityHalls = await subSubCityHallRepository.findAll({
      deleted: 'yes',
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
