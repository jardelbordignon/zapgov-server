import { enCityHallLocale } from 'src/features/city-hall/shared/locales/en'
import { enContactLocale } from 'src/features/contact/shared/locales/en'
import { enNeighborhoodLocale } from 'src/features/neighborhood/shared/locales/en'
import { enSubCityHallLocale } from 'src/features/sub-city-hall/shared/locales/en'
import { enUserLocale } from 'src/features/user/shared/locales/en'
import { enWaAccountLocale } from 'src/features/wa-account/shared/locales/en'

import { LocaleType } from './type'

export const en: LocaleType = {
  ...enUserLocale,
  ...enCityHallLocale,
  ...enSubCityHallLocale,
  ...enNeighborhoodLocale,
  ...enWaAccountLocale,
  ...enContactLocale,
}
