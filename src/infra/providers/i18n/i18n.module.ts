import { Module } from '@nestjs/common'

import { I18n } from './i18n'

@Module({
  exports: [I18n],
  providers: [I18n],
})
export class I18nModule {}
