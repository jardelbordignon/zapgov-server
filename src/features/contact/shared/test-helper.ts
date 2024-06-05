import { CreateContactInputData } from 'src/contracts/contacts'

export * from './constants'

export const CREATE_CONTACT_DATA: CreateContactInputData = {
  birth_date: new Date('1990-01-01'),
  city_hall_id: '',
  gender: 'Male',
  name: 'John Doe',
  phone: '5554 99999.9999',
}
