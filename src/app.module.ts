import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_FILTER, APP_GUARD } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import helmet from 'helmet'

import { AppController } from './app.controller'
import { FeaturesModule } from './features/features.module'
import { ServerErrorFilter } from './infra/filters/server-error.filter'
import { ThrottlerBehindProxyGuard } from './infra/guards/throttler-behind-proxy.guard'
import { InfraModule } from './infra/infra.module'
import { LangMiddleware } from './infra/middlewares/lang.middleware'
import { I18nModule } from './infra/providers/i18n/i18n.module'

@Module({
  controllers: [AppController],
  imports: [
    ThrottlerModule.forRoot([
      {
        limit: 1000,
        ttl: 3000,
      },
    ]),
    InfraModule,
    FeaturesModule,
    I18nModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ServerErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*')
    consumer.apply(LangMiddleware).forRoutes('*')
  }
}
