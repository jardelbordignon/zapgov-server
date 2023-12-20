import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import helmet from 'helmet'

import { AppController } from './app.controller'
import { FeaturesModule } from './features/features.module'
import { ServerErrorFilter } from './infra/filters/server-error.filter'
import { InfraModule } from './infra/infra.module'

@Module({
  controllers: [AppController],
  imports: [InfraModule, FeaturesModule],
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
    //consumer.apply(LoggerMiddleware).forRoutes('*')
    // if (env.name !== 'development') return
    //consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
