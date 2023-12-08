import { Injectable } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

import type {
  ModelDelegateKeys,
  PaginatorParams,
  PaginatorResponse,
} from './paginator'
import { Paginator } from './paginator'

@Injectable()
export class PrismaPaginator implements Paginator {
  constructor(private prisma: PrismaClient) {}

  async paginate<T extends ModelDelegateKeys>(
    model: T,
    params: PaginatorParams
  ): Promise<PaginatorResponse<T>> {
    const { page, perPage } = params
    const skip = (page - 1) * perPage

    const [data, total] = await this.prisma.$transaction([
      this.prisma[model].findMany({ skip, take: perPage }) as any,
      this.prisma[model].count(),
    ])

    const hasPrevious = skip > 0
    const hasNext = skip + perPage < total

    return {
      data,
      hasNext,
      hasPrevious,
      page,
      perPage,
      total,
    }
  }
}
