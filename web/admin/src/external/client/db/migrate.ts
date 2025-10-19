import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { DATABASE_URL } from '@/shared/lib/env'

const runMigration = async () => {
  console.log('⏳ Running migrations...')
  
  const migrationClient = postgres(DATABASE_URL, { max: 1 })
  const db = drizzle(migrationClient)

  try {
    await migrate(db, { migrationsFolder: './src/lib/db/migrations' })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

runMigration()