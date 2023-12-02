import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = 3000
  const logger = new Logger('Bootstrap')

  await app
    .listen(port)
    .then(async () => logger.log(`🚀 Server is running on: ${await app.getUrl()}`))
    .catch(error => logger.error(`❌ Server starts error: ${error}`))
}
bootstrap()
