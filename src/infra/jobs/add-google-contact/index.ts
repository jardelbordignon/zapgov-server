import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'

import {
  AddGoogleContactProducer,
  BullAddGoogleContactProducer,
  JOB_NAME,
  QUEUE_NAME,
} from './producer'

@Processor(QUEUE_NAME)
class AddGoogleContactConsumer {
  @Process(JOB_NAME)
  async addGoogleContactJob(job: Job<any>) {
    const { data } = job
    console.log(`\n${JOB_NAME} - data:`, data)
    // aqui faz a implementação do envio
  }
}

export {
  AddGoogleContactProducer,
  BullAddGoogleContactProducer,
  AddGoogleContactConsumer,
}
