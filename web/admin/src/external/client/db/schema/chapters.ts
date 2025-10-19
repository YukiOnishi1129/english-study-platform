import { pgTable, uuid, varchar, text, integer, timestamp, AnyPgColumn } from 'drizzle-orm/pg-core'
import { materials } from './materials'

export const chapters = pgTable('chapters', {
  id: uuid('id').defaultRandom().primaryKey(),
  materialId: uuid('material_id').notNull().references(() => materials.id, { onDelete: 'cascade' }),
  parentChapterId: uuid('parent_chapter_id').references((): AnyPgColumn => chapters.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').notNull().default(0),
  level: integer('level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})