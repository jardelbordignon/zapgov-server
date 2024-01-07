import { I18n } from 'src/infra/providers/i18n/i18n'

import { NeighborhoodEntity } from '../../neighborhood.entity'
import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'
import { CREATE_NEIGHBORHOOD_DATA } from '../../shared/test-helper'
import { NeighborhoodNotFoundError } from '../errors'

import { DeleteNeighborhoodService } from './delete-neighborhood.service'

let neighborhoodRepository: NeighborhoodRepository
let i18n: I18n
let deleteNeighborhoodService: DeleteNeighborhoodService
let neighborhood: NeighborhoodEntity

describe('Delete neighborhood', () => {
  beforeAll(async () => {
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    i18n = new I18n()
    deleteNeighborhoodService = new DeleteNeighborhoodService(
      neighborhoodRepository,
      i18n
    )
  })

  beforeEach(async () => {
    neighborhood = await neighborhoodRepository.create(CREATE_NEIGHBORHOOD_DATA)
  })

  afterEach(async () => {
    const getNeighborhoods = await neighborhoodRepository.findAll()
    for (const subNeighborhood of getNeighborhoods.data) {
      await neighborhoodRepository.delete(subNeighborhood.id)
    }
  })

  it('should be able to delete a neighborhood', async () => {
    const soft = false
    const result = await deleteNeighborhoodService.execute(neighborhood.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getNeighborhoods = await neighborhoodRepository.findAll()
    expect(getNeighborhoods.data.length).toBe(0)
  })

  it('should be able to soft delete a neighborhood', async () => {
    const soft = true
    const result = await deleteNeighborhoodService.execute(neighborhood.id, soft)

    expect(result.isSuccess()).toBe(true)
    const getNeighborhoods = await neighborhoodRepository.findAll({ deleted: 'no' })
    expect(getNeighborhoods.data.length).toBe(0)

    const getDeletedNeighborhoods = await neighborhoodRepository.findAll({
      deleted: 'yes',
    })
    expect(getDeletedNeighborhoods.data.length).toBe(1)
    expect(getDeletedNeighborhoods.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...CREATE_NEIGHBORHOOD_DATA,
          deleted_at: expect.any(Date),
        }),
      ])
    )
  })

  it('should not be able to delete a non-existent neighborhood', async () => {
    const soft = false
    const result = await deleteNeighborhoodService.execute(
      'non-existent-neighborhood-id',
      soft
    )

    expect(result.isFailure()).toBe(true)
    expect(result.value).toBeInstanceOf(NeighborhoodNotFoundError)
  })
})
