CREATE TABLE IF NOT EXISTS "vocabulary_entries" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "material_id" uuid NOT NULL,
    "headword" varchar(255) NOT NULL,
    "pronunciation" varchar(255),
    "part_of_speech" varchar(50),
    "definition_ja" text NOT NULL,
    "memo" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "vocabulary_entries"
    ADD CONSTRAINT "vocabulary_entries_material_id_materials_id_fk"
    FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_vocabulary_entries_material_id"
    ON "vocabulary_entries" ("material_id");

CREATE UNIQUE INDEX IF NOT EXISTS "uq_vocabulary_entries_material_headword"
    ON "vocabulary_entries" ("material_id", "headword");

CREATE TABLE IF NOT EXISTS "vocabulary_relations" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "vocabulary_entry_id" uuid NOT NULL,
    "relation_type" varchar(20) NOT NULL,
    "related_text" varchar(255) NOT NULL,
    "note" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "vocabulary_relations"
    ADD CONSTRAINT "vocabulary_relations_entry_fk"
    FOREIGN KEY ("vocabulary_entry_id") REFERENCES "vocabulary_entries"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_vocabulary_relations_entry"
    ON "vocabulary_relations" ("vocabulary_entry_id");

CREATE INDEX IF NOT EXISTS "idx_vocabulary_relations_type"
    ON "vocabulary_relations" ("relation_type");

ALTER TABLE "questions"
    ADD COLUMN "prompt" text;

ALTER TABLE "questions"
    ADD COLUMN "question_type" varchar(30) NOT NULL DEFAULT 'phrase';

ALTER TABLE "questions"
    ADD COLUMN "vocabulary_entry_id" uuid;

ALTER TABLE "questions"
    ADD CONSTRAINT "questions_vocabulary_entry_fk"
    FOREIGN KEY ("vocabulary_entry_id") REFERENCES "vocabulary_entries"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "idx_questions_unit_id" ON "questions" ("unit_id");
CREATE INDEX IF NOT EXISTS "idx_questions_order" ON "questions" ("unit_id", "order");
CREATE INDEX IF NOT EXISTS "idx_questions_vocabulary_entry" ON "questions" ("vocabulary_entry_id");
CREATE INDEX IF NOT EXISTS "idx_questions_type" ON "questions" ("question_type");
