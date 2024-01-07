import { PaginatedResponse, PaginationParams } from '..'

export async function inMemoryPaginator<T>(
  items: any[],
  { deleted, filter, page = '1', perPage = '20' }: PaginationParams = {}
): Promise<PaginatedResponse<T>> {
  const start = (Number(page) - 1) * Number(perPage)
  const end = start + Number(perPage)

  if (deleted !== undefined) {
    items = items.filter(({ deleted_at }) =>
      deleted === 'yes' ? !!deleted_at : !deleted_at
    )
  }

  if (typeof filter === 'string') {
    const filteredItems: any[] = []

    const [fieldsString, valuesString] = filter.split('=')

    if (fieldsString && valuesString) {
      const fields = fieldsString.split(',')

      const values = valuesString
        .split(',')
        .map(value => value.replace(/[^a-zA-Z0-9\-]/g, ''))

      values.forEach(value => {
        fields.forEach(field => {
          if (items[0]?.hasOwnProperty(field)) {
            items
              .filter(item => item[field].toLowerCase().includes(value))
              .forEach(newItem => {
                if (!filteredItems.some(item => item === newItem)) {
                  filteredItems.push(newItem)
                }
              })
          } else {
            throw new Error(`Field ${field} does not exist in the item.`)
          }
        })
      })
    }

    items = filteredItems
  }

  const data = items.slice(start, end)
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / Number(perPage))
  const hasPrevious = start > 0
  const hasNext = +end < totalItems

  return {
    data,
    meta: {
      hasNext,
      hasPrevious,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
    },
  }
}
