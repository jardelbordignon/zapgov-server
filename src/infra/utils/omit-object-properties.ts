// https://www.prisma.io/docs/concepts/components/prisma-client/excluding-fields
export function omitObjectProperties<T, Key extends keyof T>(
  obj: T,
  keys: Key[]
): Omit<T, Key> {
  for (const key of keys) {
    delete obj[key]
  }
  return obj
}
