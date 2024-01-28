import { ListParams, ListResponse } from '..'

export async function inMemoryList<T>(
  items: any[],
  { deleted, filter, order, page = '1', perPage = '20' }: ListParams = {}
): Promise<ListResponse<T>> {
  const start = (Number(page) - 1) * Number(perPage)
  const end = start + Number(perPage)

  if (deleted !== undefined) {
    items = items.filter(({ deleted_at }) =>
      deleted === 'yes' ? !!deleted_at : !deleted_at
    )
  }

  // filter=name:abc,slug:def|name:!fgh,phone:54
  if (typeof filter === 'string') {
    let filteredItems: any[] = []

    filter.split('|').forEach(pairs => {
      pairs.split(',').forEach(pair => {
        const [key, value] = pair.split(':')

        const denials: Array<{ key: string; value: string }> = []

        if (value && items[0]?.hasOwnProperty(key)) {
          const isDenial = value.startsWith('!')
          const contains = value.replace(/[^a-zA-Z0-9\-]/g, '')
          if (isDenial) {
            denials.push({ key, value: contains })
          } else {
            items
              .filter(item => item[key].toLowerCase().includes(contains))
              .forEach(newItem => {
                if (!filteredItems.some(item => item === newItem)) {
                  filteredItems.push(newItem)
                }
              })
          }
        } else {
          throw new Error(`Field ${key} does not exist in the item.`)
        }

        denials.forEach(({ key, value }) => {
          filteredItems = filteredItems.filter(
            item => !item[key].toLowerCase().includes(value)
          )
        })
      })
    })

    // const [fieldsString, valuesString] = filter.split('=')

    // if (fieldsString && valuesString) {
    //   const fields = fieldsString.split(',')

    //   const values = valuesString
    //     .split(',')
    //     .map(value => value.replace(/[^a-zA-Z0-9\-]/g, ''))

    //   values.forEach(value => {
    //     fields.forEach(field => {
    //       if (items[0]?.hasOwnProperty(field)) {
    //         items
    //           .filter(item => item[field].toLowerCase().includes(value))
    //           .forEach(newItem => {
    //             if (!filteredItems.some(item => item === newItem)) {
    //               filteredItems.push(newItem)
    //             }
    //           })
    //       } else {
    //         throw new Error(`Field ${field} does not exist in the item.`)
    //       }
    //     })
    //   })
    // }

    items = filteredItems
  }

  if (order) {
    const [field, sort] = order.split('.')

    if (field !== 'id' && items[0]?.hasOwnProperty(field)) {
      items.sort((a, b) => {
        return sort === 'desc'
          ? b[field].localeCompare(a[field])
          : a[field].localeCompare(b[field])
      })
    }
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
