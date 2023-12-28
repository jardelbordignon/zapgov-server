import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import helmet from 'helmet'

import { AppController } from './app.controller'
import { FeaturesModule } from './features/features.module'
import { ServerErrorFilter } from './infra/filters/server-error.filter'
import { InfraModule } from './infra/infra.module'
import { LangMiddleware } from './infra/middlewares/lang.middleware'
import { I18nModule } from './infra/providers/i18n/i18n.module'

@Module({
  controllers: [AppController],
  imports: [InfraModule, FeaturesModule, I18nModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ServerErrorFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*')
    consumer.apply(LangMiddleware).forRoutes('*')
    //consumer.apply(LoggerMiddleware).forRoutes('*')
    // if (env.name !== 'development') return
    //consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
