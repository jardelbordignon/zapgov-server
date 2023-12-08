import { PrismaClient } from '@prisma/client'

export type ModelDelegateKeys = {
  [K in keyof PrismaClient]: PrismaClient[K] extends { findMany: any } ? K : never
}[keyof PrismaClient]

export type PaginatorParams = {
  page: number
  perPage: number
}

export type PaginatorResponse<T> = PaginatorParams & {
  data: T[]
  total: number
  hasPrevious: boolean
  hasNext: boolean
}

export abstract class Paginator {
  abstract paginate<T extends ModelDelegateKeys>(
    model: T,
    params: PaginatorParams
  ): Promise<PaginatorResponse<T>>
}
