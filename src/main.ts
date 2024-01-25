import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { configs } from './configs'
import { EnvService } from './infra/env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = app.get(EnvService).get('PORT')
  const logger = new Logger('Bootstrap')

  configs(app)

  await app
    .listen(port)
    .then(async () => {
      global['serverUrl'] = await app.getUrl()
      logger.log(`🚀 Server is running on: ${global['serverUrl']}`)
    })
    .catch(error => logger.error(`❌ Server starts error: ${error}`))
}
bootstrap()
