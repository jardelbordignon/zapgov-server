// import { GoogleAuth } from 'google-auth-library'
// import { google } from 'googleapis'

// const auth = new GoogleAuth({
//   scopes: ['https://www.googleapis.com/auth/contacts'],
// })

// export async function addGoogleContact() {
//   const people = google.people({ auth, version: 'v1' })

//   const contact = {
//     emailAddresses: [{ value: 'john.doe@example.com' }],
//     names: [{ familyName: 'Doe', givenName: 'John' }],
//   }

//   try {
//     const res = await people.people.createContact({ resource: contact })
//     console.log(res.data)
//   } catch (err) {
//     console.error('The API returned an error: ' + err)
//   }
// }
