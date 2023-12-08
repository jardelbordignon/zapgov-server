import type { CityHall } from '@prisma/client'

type OmitOnCrete = 'id' | 'created_at' | 'updated_at' | 'deleted_at'
/** POST - /city-hall */
export type CreateCityHallData = Omit<CityHall, OmitOnCrete>
