export const slugify = (text: string): string =>
  text
    .normalize('NFD') // separate accent from letter
    .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
    .toLowerCase()
    .replace(/ /g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text

export const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

export const toCamelCase = (text: string): string =>
  text
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '')

export const toSnakeCase = (text: string): string =>
  text.replace(/([A-Z])/g, '_$1').toLowerCase()

export const toPascalCase = (text: string): string =>
  text.replace(/(?:^\w|[A-Z]|\b\w)/g, word => word.toUpperCase()).replace(/\s+/g, '')

export const pluralize = (count: number, word: string, suffix = 's') =>
  `${word}${count !== 1 ? suffix : ''}`
