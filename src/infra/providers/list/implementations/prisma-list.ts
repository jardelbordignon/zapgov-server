import { Prisma } from '@prisma/client'

import { ListParams, ListResponse } from '..'

export async function prismaList<T>(
  model: any, // a prisma model
  {
    add,
    addDeleted,
    deleted,
    filter,
    order,
    page = '1',
    perPage = '20',
  }: ListParams = {}
): Promise<ListResponse<T>> {
  const take = Number(perPage)
  const skip = (Number(page) - 1) * take

  // https://stackoverflow.com/questions/71658510/how-can-i-get-the-all-fields-from-prisma-class
  const Model = Prisma.dmmf.datamodel.models.find(m => m.name === model.name)

  if (!Model) throw new Error(`Model ${model.name} not found.`)
  //console.log('Model', JSON.stringify(Model, null, 2))

  const textFields: string[] = []
  const dateFields: string[] = []
  const relations: string[] = []

  Model.fields.forEach(field => {
    if (field.isId) return
    if (field.type === 'String') {
      textFields.push(field.name)
    } else if (field.type === 'DateTime') {
      dateFields.push(field.name)
    } else if (field.relationName) {
      relations.push(field.name)
    }
  })

  const where: Prisma.UserWhereInput = {}

  if (deleted !== undefined) {
    Object.assign(
      where,
      deleted === 'yes' ? { NOT: { deleted_at: null } } : { deleted_at: null }
    )
  }

  // if (typeof filter === 'string') {
  //   const [fieldsString, valuesString] = filter.split('=')

  //   if (fieldsString && valuesString) {
  //     const fields = fieldsString.split(',')

  //     const values = valuesString
  //       .split(',')
  //       .map(value => value.replace(/[^a-zA-Z0-9\-]/g, ''))

  //     const filterConditions: Record<string, any>[] = []

  //     values.forEach(value => {
  //       const fieldValuePairs: Record<string, any> = {}
  //       fields.forEach(field => {
  //         if (textFields.includes(field)) {
  //           fieldValuePairs[field] = { contains: value, mode: 'insensitive' }
  //         }
  //         // else { throw new Error(`Field ${field} does not exist in the model.`) }
  //       })
  //       filterConditions.push(fieldValuePairs)
  //     })

  //     Object.assign(where, { [filterCondition]: filterConditions })
  //   }
  // }

  // filter=name:abc,slug:def|name:fgh,
  if (typeof filter === 'string') {
    const conditions = filter.split('|')

    const filterConditions: Prisma.UserWhereInput[] = []

    conditions.forEach(condition => {
      const pairs = condition.split(',')

      const conditionPairs: Prisma.UserWhereInput = {}

      pairs.forEach(pair => {
        const [field, value] = pair.split(':')

        if (!value) return

        if (textFields.includes(field)) {
          conditionPairs[field] = {
            contains: value.replace(/[^a-zA-Z0-9\-]/g, ''),
            mode: 'insensitive',
          }
        }
      })

      filterConditions.push({ AND: conditionPairs })
    })

    Object.assign(where, { OR: filterConditions })
  }

  let orderBy: Record<string, 'asc' | 'desc'> = {}

  if (order) {
    const [field, sort] = order.split('.')

    if (textFields.concat(dateFields).includes(field)) {
      orderBy = { [field]: sort === 'desc' ? 'desc' : 'asc' }
    }
  }

  let include: Record<string, boolean | object> = {}

  if (add) {
    let relationsCondition: boolean | object = true

    if (addDeleted !== undefined) {
      relationsCondition = {
        where:
          addDeleted === 'yes' ? { NOT: { deleted_at: null } } : { deleted_at: null },
      }
    }

    add.split(',').forEach(field => {
      if (relations.includes(field)) {
        include = {
          ...include,
          [field]: relationsCondition,
        }
      }
    })
  }

  console.log('\nwhere:\n', JSON.stringify(where, null, 2))
  console.log('\norderBy:\n', JSON.stringify(orderBy, null, 2))
  console.log('\ninclude:\n', JSON.stringify(include, null, 2))

  const [data, totalItems] = await Promise.all([
    model.findMany({ include, orderBy, skip, take, where }),
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
