export function calcAge(birth_date: Date): number {
  const today = new Date()
  const birthDate = new Date(birth_date)

  let age = today.getFullYear() - birthDate.getFullYear()

  const diffMouths = today.getMonth() - birthDate.getMonth()
  if (diffMouths < 0 || (diffMouths === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
