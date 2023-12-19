import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import helmet from 'helmet'

import { AppController } from './app.controller'
import { FeaturesModule } from './features/features.module'
import { InfraModule } from './infra/infra.module'
//import { LoggerMiddleware } from './infra/middlewares/logger'

@Module({
  controllers: [AppController],
  imports: [InfraModule, FeaturesModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet()).forRoutes('*')
    //consumer.apply(LoggerMiddleware).forRoutes('*')
    // if (env.name !== 'development') return
    //consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
