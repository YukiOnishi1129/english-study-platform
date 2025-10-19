import type { Config } from 'drizzle-kit'
import { DATABASE_URL } from './src/lib/env'

export default {
  schema: './src/lib/db/schema/*.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
} satisfies Config