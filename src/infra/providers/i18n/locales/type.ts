import type { CityHallLocaleType } from 'src/features/city-hall/shared/locales/type'
import { ContactLocaleType } from 'src/features/contact/shared/locales/type'
import type { NeighborhoodLocaleType } from 'src/features/neighborhood/shared/locales/type'
import type { SubCityHallLocaleType } from 'src/features/sub-city-hall/shared/locales/type'
import type { UserLocaleType } from 'src/features/user/shared/locales/type'
import type { WaAccountLocaleType } from 'src/features/wa-account/shared/locales/type'

export type LocaleType = UserLocaleType &
  CityHallLocaleType &
  SubCityHallLocaleType &
  NeighborhoodLocaleType &
  WaAccountLocaleType &
  ContactLocaleType
