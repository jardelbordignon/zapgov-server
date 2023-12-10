import type { SubCityHall } from '@prisma/client'

type OmitOnUpdate = 'id' | 'created_at' | 'updated_at'
type OmitOnCreate = OmitOnUpdate | 'deleted_at'

/** POST - /city-hall */
export type CreateSubCityHallData = Omit<SubCityHall, OmitOnCreate>
export type UpdateSubCityHallData = Partial<Omit<SubCityHall, OmitOnUpdate>>
