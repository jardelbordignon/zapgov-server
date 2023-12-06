import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { EnvService } from './infra/env/env.service'

export function configs(app: INestApplication) {
  app.enableCors({ allowedHeaders: '*', origin: '*' })

  const environment = app.get(EnvService).get('NODE_ENV')

  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ZapGov')
      .setDescription('The ZapGov api documentation')
      .setVersion('0.1')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('doc', app, document, {
      swaggerOptions: {
        apisSorter: 'alpha',
        operationsSorter: 'alpha',
        tagsSorter: 'alpha',
      },
    })
  }
}
