import { InMemoryNeighborhoodRepository } from '../../repositories/in-memory.neighborhood.repository'
import { NeighborhoodRepository } from '../../repositories/neighborhood.repository'
import { NeighborhoodNotFoundError } from '../errors'
import { CREATE_NEIGHBORHOOD_DATA } from '../test-helper'

import { DeleteNeighborhoodService } from './delete-neighborhood.service'

let neighborhoodRepository: NeighborhoodRepository
let deleteNeighborhoodService: DeleteNeighborhoodService

describe('Delete neighborhood', () => {
  beforeAll(async () => {
    neighborhoodRepository = new InMemoryNeighborhoodRepository()
    deleteNeighborhoodService = new DeleteNeighborhoodService(neighborhoodRepository)
  })

  beforeEach(async () => {
    await neighborhoodRepository.create(CREATE_NEIGHBORHOOD_DATA)
  })

  afterEach(async () => {
    const getNeighborhoods = await neighborhoodRepository.findAll({
      page: 1,
      perPage: 100,
    })
    for (const subNeighborhood of getNeighborhoods.data) {
      await neighborhoodRepository.delete(subNeighborhood.id)
    }
  })

  it('should be able to delete a neighborhood', async () => {
    const defaultNeighborhood = await neighborhoodRepository.findByName(
      CREATE_NEIGHBORHOOD_DATA.name
    )
    const soft = false
    const result = await deleteNeighborhoodService.execute(
      defaultNeighborhood.id,
      soft
    )

    expect(result.isSuccess()).toBe(true)
    const getNeighborhoods = await neighborhoodRepository.findAll({
      page: 1,
      perPage: 100,
    })
    expect(getNeighborhoods.data.length).toBe(0)
  })

  it('should be able to soft delete a neighborhood', async () => {
    const defaultNeighborhood = await neighborhoodRepository.findByName(
      CREATE_NEIGHBORHOOD_DATA.name
    )
    const soft = true
    const result = await deleteNeighborhoodService.execute(
      defaultNeighborhood.id,
      soft
    )

    expect(result.isSuccess()).toBe(true)
    const getNeighborhoods = await neighborhoodRepository.findAll({
      page: 1,
      perPage: 100,
    })
    expect(getNeighborhoods.data.length).toBe(0)

    const getDeletedNeighborhoods = await neighborhoodRepository.findAllDeleted({
      page: 1,
      perPage: 100,
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
