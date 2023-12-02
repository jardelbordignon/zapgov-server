import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_EXPIRES_IN: z.string().default('30 days'),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  NODE_ENV: z
    .enum(['development', 'test', 'homolog', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
})

export type Env = z.infer<typeof envSchema>
