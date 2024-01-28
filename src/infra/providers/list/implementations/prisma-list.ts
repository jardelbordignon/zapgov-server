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

  // filter=name:abc,slug:def|name:!fgh,phone:54
  if (typeof filter === 'string') {
    const OR: Prisma.UserWhereInput[] = []

    filter.split('|').forEach(pairs => {
      const AND: Prisma.UserWhereInput[] = []
      const NOT: Prisma.UserWhereInput[] = []

      pairs.split(',').forEach(pair => {
        const [key, value] = pair.split(':')

        if (value && textFields.includes(key)) {
          const arr = value.startsWith('!') ? NOT : AND
          const contains = value.replace(/[^a-zA-Z0-9\-]/g, '')
          arr.push({ [key]: { contains, mode: 'insensitive' } })
        }
      })

      if (NOT.length) {
        AND.push({ NOT })
      }

      OR.push({ AND })
    })

    Object.assign(where, { OR })
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

  // console.log('\nwhere:\n', JSON.stringify(where, null, 2))
  // console.log('\norderBy:\n', JSON.stringify(orderBy, null, 2))
  // console.log('\ninclude:\n', JSON.stringify(include, null, 2))

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
