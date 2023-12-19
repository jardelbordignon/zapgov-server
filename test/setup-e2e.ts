import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { existsSync, promises } from 'node:fs'

import { PrismaClient } from '@prisma/client'

import 'dotenv/config'

const prisma = new PrismaClient()
const schemaId = randomUUID()

function generateTestDatabaseUrl() {
  if (!process.env.DATABASE_URL)
    throw new Error('Please provide a DATABASE_URL environment variable.')

  const url = new URL(process.env.DATABASE_URL)

  url.searchParams.set('schema', schemaId)

  return url.toString()
}

beforeAll(async () => {
  process.env.DATABASE_URL = generateTestDatabaseUrl()
  execSync('yarn prisma migrate deploy')
})

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()

  if (existsSync('./test/public'))
    await promises.rmdir('./test/public', { recursive: true })
})
