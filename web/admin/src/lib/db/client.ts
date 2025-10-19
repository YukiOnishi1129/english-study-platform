import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { DATABASE_URL } from '../env'

const queryClient = postgres(DATABASE_URL)
export const db = drizzle(queryClient)