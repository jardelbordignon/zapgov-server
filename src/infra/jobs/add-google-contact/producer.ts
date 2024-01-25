import { InjectQueue } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bull'

export const QUEUE_NAME = 'addGoogleContactsQueue'
export const JOB_NAME = 'addGoogleContactJob'

export abstract class AddGoogleContactProducer {
  abstract send(data: any): Promise<void>
}

@Injectable()
export class BullAddGoogleContactProducer implements AddGoogleContactProducer {
  constructor(@InjectQueue(QUEUE_NAME) private queue: Queue) {}

  async send(data: any) {
    await this.queue.add(JOB_NAME, data, { delay: 1000 })
  }
}

export class FakeAddGoogleContactProducer implements AddGoogleContactProducer {
  async send(data: any) {
    console.log(`send: ${data}`)
  }
}
