import { z } from 'zod'

export const envSchema = z
  .object({
    DATABASE_URL: z.string().url(),
    JWT_ACCESS_EXPIRES_IN: z.string().default('30 days'),
    JWT_PRIVATE_KEY: z.string(),
    JWT_PUBLIC_KEY: z.string(),
    NODE_ENV: z
      .enum(['development', 'test', 'homolog', 'production'])
      .default('development'),
    PORT: z.coerce.number().default(4000),
    PUBLIC_DIRECTORY: z.string(),

    STORAGE_AWS_REGION: z.string().default('us-east-1'),
    STORAGE_AWS_S3_BUCKET: z.string().optional(),
    STORAGE_DRIVER: z.enum(['disk', 'cloudinary', 's3']).default('disk'),
  })
  .refine(
    data => {
      if (data.STORAGE_DRIVER === 's3') {
        return data.STORAGE_AWS_S3_BUCKET !== undefined
      }
      return true
    },
    {
      message: "STORAGE_S3_BUCKET is required when STORAGE_DRIVER is 's3'",
    }
  )

export type Env = z.infer<typeof envSchema>
