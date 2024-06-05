import { Process, Processor } from '@nestjs/bull'
import { Job } from 'bull'
import { google } from 'googleapis'

import { CreateContactData } from 'src/contracts/contacts'

import { GoogleContact } from './google-contact'
import {
  AddGoogleContactProducer,
  BullAddGoogleContactProducer,
  JOB_NAME,
  QUEUE_NAME,
} from './producer'

@Processor(QUEUE_NAME)
class AddGoogleContactConsumer {
  @Process(JOB_NAME)
  async addGoogleContactJob(job: Job<CreateContactData>) {
    const jwtClient = new google.auth.JWT({
      email: process.env.GOOGLE_JWT_EMAIL,
      key: process.env.GOOGLE_JWT_KEY,
      scopes: process.env.GOOGLE_JWT_SCOPES!.split(','),
      subject: 'admin@zapgov.org',
    })

    const { gender, name, phone, wa_account_id } = job.data

    try {
      const people = google.people({ auth: jwtClient, version: 'v1' })

      const requestBody = new GoogleContact({
        code: 'CZO-0001',
        gender,
        name,
        neighborhood: 'neighborhood',
        phone_number: phone,
        year_old: '1990',
      }).payloadGoogleContact()

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
