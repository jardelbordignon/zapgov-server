import { Prisma } from '@prisma/client'

import { PaginatedResponse, PaginationParams } from '..'

export async function prismaPaginator<T>(
  model: any, // a prisma model
  { deleted, filter, page = '1', perPage = '20' }: PaginationParams = {}
): Promise<PaginatedResponse<T>> {
  const take = Number(perPage)
  const skip = (Number(page) - 1) * take

  const where: Prisma.UserWhereInput = {}

  if (deleted !== undefined) {
    Object.assign(
      where,
      deleted === 'yes' ? { NOT: { deleted_at: null } } : { deleted_at: null }
    )
  }

  if (typeof filter === 'string') {
    const [fieldsString, valuesString] = filter.split('=')

    if (fieldsString && valuesString) {
      const fields = fieldsString.split(',')

      const values = valuesString
        .split(',')
        .map(value => value.replace(/[^a-zA-Z0-9\-]/g, ''))

      const OR: Record<string, any>[] = []

      // https://stackoverflow.com/questions/71658510/how-can-i-get-the-all-fields-from-prisma-class
      const Model = Prisma.dmmf.datamodel.models.find(m => m.name === model.name)

      if (!Model) throw new Error(`Model ${model.name} not found.`)
      //console.log('Model', Model)

      const excludedFields = ['id', 'created_at', 'updated_at', 'deleted_at']

      const validFilterableFields = Model.fields
        .filter(field => !excludedFields.includes(field.name))
        .map(field => field.name)

      values.forEach(value => {
        const fieldValuePairs: Record<string, any> = {}
        fields.forEach(field => {
          if (validFilterableFields.includes(field)) {
            fieldValuePairs[field] = { contains: value, mode: 'insensitive' }
          }
          // else { throw new Error(`Field ${field} does not exist in the model.`) }
        })
        OR.push(fieldValuePairs)
      })

      Object.assign(where, { OR })
    }
  }

  // console.log('\nwhere:\n', JSON.stringify(where, null, 2))

  const [data, totalItems] = await Promise.all([
    model.findMany({ skip, take, where }),
    model.count({ where }),
  ])

  return {
    data,
    meta: {
      hasNext: skip + take < totalItems,
      hasPrevious: skip > 0,
      page: Number(page),
      perPage: take,
      totalItems,
      totalPages: Math.ceil(totalItems / take),
    },
  }
}
