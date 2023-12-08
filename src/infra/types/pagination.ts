export type PaginationParams = {
  page: number
  perPage: number
}

export type PaginatedResponse<T> = PaginationParams & {
  data: T[]
  total: number
  hasPrevious: boolean
  hasNext: boolean
}
