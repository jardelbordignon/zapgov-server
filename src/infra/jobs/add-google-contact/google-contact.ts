export type GoogleContactData = {
  name: string
  code: string
  year_old: string
  gender: string
  phone_number: string
  neighborhood: string
}

export class GoogleContact {
  userDefined: { key: string; value: string }[] = []

  names: {
    givenName: string
    familyName: string
  }[] = []

  phoneNumbers: { value: string }[] = []

  name: string
  code: string
  year_old: string
  gender: string
  phone_number: string
  neighborhood: string

  constructor({
    code = '',
    gender = '',
    name = '',
    neighborhood = '',
    phone_number = '',
    year_old = '',
  }: GoogleContactData) {
    // console.log({ code, gender, name, neighborhood, phone_number, year_old })
    ;(this.code = code),
      (this.name = name),
      (this.year_old = year_old),
      (this.gender = gender),
      (this.neighborhood = neighborhood),
      (this.phone_number = phone_number)
  }

  // custom
  setUserDefinedArray() {
    this.userDefined.push({
      key: 'familyNameYomi',
      value: this.gender,
    })

    this.userDefined.push({
      key: 'givenNameYomi',
      value: this.year_old,
    })

    this.userDefined.push({
      key: 'namePrefix',
      value: this.code,
    })
  }

  setNamesArray() {
    this.names.push({
      familyName: this.neighborhood,
      givenName: this.name,
    })
  }

  setPhoneNumberArray() {
    this.phoneNumbers.push({
      value: this.phone_number,
    })
  }

  payloadGoogleContact() {
    this.setNamesArray()
    this.setPhoneNumberArray()
    this.setUserDefinedArray()

    const contactData = {
      names: this.names,
      phoneNumbers: this.phoneNumbers,
      userDefined: this.userDefined,
    }

    return contactData
  }
}
