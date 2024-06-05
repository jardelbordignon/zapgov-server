import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { google } from 'googleapis'

import { GoogleContact, GoogleContactData } from './google-contact'
import {
  AddGoogleContactProducer,
  BullAddGoogleContactProducer,
  JOB_NAME,
  QUEUE_NAME,
} from './producer'

@Processor(QUEUE_NAME)
class AddGoogleContactConsumer {
  @Process(JOB_NAME)
  async addGoogleContactJob(job: Job<GoogleContactData>) {
    const jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_JWT_EMAIL,
      key: process.env.GOOGLE_JWT_KEY,
      scopes: process.env.GOOGLE_JWT_SCOPES!.split(','),
      subject: 'admin@zapgov.org',
    })

    try {
      const people = google.people({ auth: jwtClient, version: 'v1' })

      const requestBody = new GoogleContact(job.data).payloadGoogleContact()

      const response = await people.people.createContact({ requestBody })

      return response.data
    } catch (error) {
      console.error('Error creating contact', error)
    }
  }
}

export {
  AddGoogleContactProducer,
  BullAddGoogleContactProducer,
  AddGoogleContactConsumer,
}
