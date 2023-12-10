import type { CityHall } from '@prisma/client'

type OmitOnUpdate = 'id' | 'created_at' | 'updated_at'
type OmitOnCrete = OmitOnUpdate | 'deleted_at'

/** POST - /city-hall */
export type CreateCityHallData = Omit<CityHall, OmitOnCrete>
export type UpdateCityHallData = Partial<Omit<CityHall, OmitOnUpdate>>
