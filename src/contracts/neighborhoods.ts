import type { Neighborhood } from '@prisma/client'

type OmitOnUpdate = 'id' | 'created_at' | 'updated_at'
type OmitOnCreate = OmitOnUpdate | 'deleted_at'

export type CreateNeighborhoodData = Omit<Neighborhood, OmitOnCreate>
export type UpdateNeighborhoodData = Partial<Omit<Neighborhood, OmitOnUpdate>>
