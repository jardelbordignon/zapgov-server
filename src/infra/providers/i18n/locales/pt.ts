import { ptCityHallLocale } from 'src/features/city-hall/shared/locales/pt'
import { ptNeighborhoodLocale } from 'src/features/neighborhood/shared/locales/pt'
import { ptSubCityHallLocale } from 'src/features/sub-city-hall/shared/locales/pt'
import { ptUserLocale } from 'src/features/user/shared/locales/pt'
import { ptWaAccountLocale } from 'src/features/wa-account/shared/locales/pt'

import { LocaleType } from './type'

export const pt: LocaleType = {
  ...ptUserLocale,
  ...ptCityHallLocale,
  ...ptSubCityHallLocale,
  ...ptNeighborhoodLocale,
  ...ptWaAccountLocale,
}
