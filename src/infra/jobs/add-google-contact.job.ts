import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { Injectable } from '@nestjs/common'
import { Job, Queue } from 'bull'

@Processor('addGoogleContactsQueue')
export class AddGoogleContactConsumer {
  @Process('addGoogleContactJob')
  async addGoogleContactJob(job: Job<any>) {
    const { data } = job
    console.log('\naddGoogleContactJob - data:', data)
    // aqui faz a implementação do envio
  }
}

@Injectable()
export class AddGoogleContactProducer {
  constructor(
    @InjectQueue('addGoogleContactsQueue') private addGoogleContactsQueue: Queue
  ) {}

  async send(data: any) {
    await this.addGoogleContactsQueue.add('addGoogleContactJob', data, {
      delay: 1000,
    })
  }
}
