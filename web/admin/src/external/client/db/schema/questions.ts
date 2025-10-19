import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { units } from './units'

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  unitId: uuid('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  japanese: text('japanese').notNull(),
  hint: text('hint'),
  explanation: text('explanation'),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})