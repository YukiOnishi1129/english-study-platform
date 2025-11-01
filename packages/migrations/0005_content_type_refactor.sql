-- Content type / study mode normalization and question subtype tables

CREATE TABLE IF NOT EXISTS "content_types" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" varchar(50) NOT NULL UNIQUE,
    "name" varchar(100) NOT NULL,
    "description" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "study_modes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" varchar(50) NOT NULL UNIQUE,
    "name" varchar(100) NOT NULL,
    "description" text,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "content_type_study_modes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "content_type_id" uuid NOT NULL,
    "study_mode_id" uuid NOT NULL,
    "priority" integer NOT NULL DEFAULT 0,
    "is_default" boolean NOT NULL DEFAULT false,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_content_type_study_mode_pair"
    ON "content_type_study_modes" ("content_type_id", "study_mode_id");

CREATE TABLE IF NOT EXISTS "phrase_questions" (
    "question_id" uuid PRIMARY KEY,
    "prompt_ja" text NOT NULL,
    "prompt_en" text,
    "hint" text,
    "explanation" text,
    "audio_url" text,
    CONSTRAINT "phrase_questions_question_id_fkey"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "vocabulary_questions" (
    "question_id" uuid PRIMARY KEY,
    "vocabulary_entry_id" uuid,
    "headword" varchar(255) NOT NULL,
    "pronunciation" varchar(255),
    "part_of_speech" varchar(50),
    "definition_ja" text NOT NULL,
    "memo" text,
    "example_sentence_en" text,
    "example_sentence_ja" text,
    CONSTRAINT "vocabulary_questions_question_id_fkey"
        FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE,
    CONSTRAINT "vocabulary_questions_entry_fkey"
        FOREIGN KEY ("vocabulary_entry_id") REFERENCES "vocabulary_entries"("id") ON DELETE SET NULL
);

ALTER TABLE "materials"
    ADD COLUMN IF NOT EXISTS "content_type_id" uuid;

ALTER TABLE "chapters"
    ADD COLUMN IF NOT EXISTS "content_type_id" uuid;

ALTER TABLE "units"
    ADD COLUMN IF NOT EXISTS "content_type_id" uuid;

ALTER TABLE "questions"
    ADD COLUMN IF NOT EXISTS "content_type_id" uuid,
    ADD COLUMN IF NOT EXISTS "question_variant" varchar(50) DEFAULT 'phrase';

ALTER TABLE "questions"
    ALTER COLUMN "japanese" DROP NOT NULL;

ALTER TABLE "user_answers"
    ADD COLUMN IF NOT EXISTS "content_type_id" uuid,
    ADD COLUMN IF NOT EXISTS "study_mode_id" uuid,
    ADD COLUMN IF NOT EXISTS "mode_code" varchar(50);

ALTER TABLE "question_statistics"
    ADD COLUMN IF NOT EXISTS "content_type_id" uuid,
    ADD COLUMN IF NOT EXISTS "study_mode_id" uuid,
    ADD COLUMN IF NOT EXISTS "mode_code" varchar(50) DEFAULT 'aggregate';

INSERT INTO "content_types" ("code", "name", "description")
VALUES
    ('phrase', '例文', '既存の例文教材'),
    ('vocabulary', '語彙', '語彙教材'),
    ('conversation', '会話', 'ロールプレイ会話教材'),
    ('listening', 'リスニング', 'リスニング教材'),
    ('writing', 'ライティング', 'ライティング教材')
ON CONFLICT ("code") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "updated_at" = now();

INSERT INTO "study_modes" ("code", "name", "description")
VALUES
    ('jp_to_en', '日→英', '日本語から英語へアウトプットする練習'),
    ('en_to_jp', '英→日', '英語から日本語へ理解する練習'),
    ('sentence', '例文', '例文ベースのアウトプット'),
    ('conversation_roleplay', '会話ロールプレイ', '会話ロールプレイの練習'),
    ('listening_comprehension', 'リスニング', 'リスニング理解の練習'),
    ('writing_review', '英作文', '英作文／ライティング練習')
ON CONFLICT ("code") DO UPDATE
SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description",
    "updated_at" = now();

WITH phrase_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'phrase' LIMIT 1
),
sentence_mode AS (
    SELECT "id" FROM "study_modes" WHERE "code" = 'sentence' LIMIT 1
)
INSERT INTO "content_type_study_modes" ("content_type_id", "study_mode_id", "priority", "is_default")
SELECT p."id", s."id", 0, true FROM phrase_ct p CROSS JOIN sentence_mode s
ON CONFLICT ("content_type_id", "study_mode_id") DO UPDATE
SET
    "priority" = EXCLUDED."priority",
    "is_default" = EXCLUDED."is_default",
    "updated_at" = now();

WITH vocabulary_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'vocabulary' LIMIT 1
)
INSERT INTO "content_type_study_modes" ("content_type_id", "study_mode_id", "priority", "is_default")
SELECT v."id", m."id", vals."priority", vals."is_default"
FROM vocabulary_ct v
JOIN (
    VALUES
        (0, true, 'jp_to_en'),
        (1, false, 'en_to_jp'),
        (2, false, 'writing_review')
) AS vals("priority", "is_default", "code") ON true
JOIN "study_modes" m ON m."code" = vals."code"
ON CONFLICT ("content_type_id", "study_mode_id") DO UPDATE
SET
    "priority" = EXCLUDED."priority",
    "is_default" = EXCLUDED."is_default",
    "updated_at" = now();

WITH phrase_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'phrase' LIMIT 1
)
UPDATE "materials" m
SET "content_type_id" = (SELECT "id" FROM phrase_ct)
WHERE m."content_type_id" IS NULL;

WITH phrase_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'phrase' LIMIT 1
)
UPDATE "chapters" c
SET "content_type_id" = (SELECT "id" FROM phrase_ct)
WHERE c."content_type_id" IS NULL;

WITH phrase_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'phrase' LIMIT 1
)
UPDATE "units" u
SET "content_type_id" = (SELECT "id" FROM phrase_ct)
WHERE u."content_type_id" IS NULL;

WITH vocabulary_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'vocabulary' LIMIT 1
)
UPDATE "units" u
SET "content_type_id" = (SELECT "id" FROM vocabulary_ct)
WHERE EXISTS (
    SELECT 1
    FROM "questions" q
    WHERE q."unit_id" = u."id" AND q."question_type" = 'vocabulary'
);

WITH vocabulary_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'vocabulary' LIMIT 1
)
UPDATE "chapters" c
SET "content_type_id" = (SELECT "id" FROM vocabulary_ct)
WHERE EXISTS (
    SELECT 1
    FROM "units" u
    WHERE u."chapter_id" = c."id" AND u."content_type_id" = (SELECT "id" FROM vocabulary_ct)
);

WITH vocabulary_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'vocabulary' LIMIT 1
)
UPDATE "materials" m
SET "content_type_id" = (SELECT "id" FROM vocabulary_ct)
WHERE EXISTS (
    SELECT 1
    FROM "chapters" c
    JOIN "units" u ON u."chapter_id" = c."id"
    WHERE c."material_id" = m."id" AND u."content_type_id" = (SELECT "id" FROM vocabulary_ct)
);

WITH question_mapping AS (
    SELECT
        q."id",
        CASE
            WHEN q."question_type" = 'vocabulary' THEN 'vocabulary'
            ELSE COALESCE(q."question_type", 'phrase')
        END AS variant_code
    FROM "questions" q
)
UPDATE "questions" q
SET "question_variant" = qm.variant_code
FROM question_mapping qm
WHERE q."id" = qm."id";

WITH vocabulary_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'vocabulary' LIMIT 1
),
phrase_ct AS (
    SELECT "id" FROM "content_types" WHERE "code" = 'phrase' LIMIT 1
)
UPDATE "questions" q
SET "content_type_id" = CASE
    WHEN q."question_type" = 'vocabulary' THEN (SELECT "id" FROM vocabulary_ct)
    ELSE (SELECT "id" FROM phrase_ct)
END;

INSERT INTO "phrase_questions" ("question_id", "prompt_ja", "prompt_en", "hint", "explanation")
SELECT q."id", q."japanese", q."prompt", q."hint", q."explanation"
FROM "questions" q
WHERE q."question_type" IS DISTINCT FROM 'vocabulary'
ON CONFLICT ("question_id") DO UPDATE
SET
    "prompt_ja" = EXCLUDED."prompt_ja",
    "prompt_en" = EXCLUDED."prompt_en",
    "hint" = EXCLUDED."hint",
    "explanation" = EXCLUDED."explanation";

INSERT INTO "vocabulary_questions" (
    "question_id",
    "vocabulary_entry_id",
    "headword",
    "pronunciation",
    "part_of_speech",
    "definition_ja",
    "memo",
    "example_sentence_en",
    "example_sentence_ja"
)
SELECT
    q."id",
    q."vocabulary_entry_id",
    ve."headword",
    ve."pronunciation",
    ve."part_of_speech",
    ve."definition_ja",
    ve."memo",
    ve."example_sentence_en",
    ve."example_sentence_ja"
FROM "questions" q
JOIN "vocabulary_entries" ve ON ve."id" = q."vocabulary_entry_id"
WHERE q."question_type" = 'vocabulary'
ON CONFLICT ("question_id") DO UPDATE
SET
    "vocabulary_entry_id" = EXCLUDED."vocabulary_entry_id",
    "headword" = EXCLUDED."headword",
    "pronunciation" = EXCLUDED."pronunciation",
    "part_of_speech" = EXCLUDED."part_of_speech",
    "definition_ja" = EXCLUDED."definition_ja",
    "memo" = EXCLUDED."memo",
    "example_sentence_en" = EXCLUDED."example_sentence_en",
    "example_sentence_ja" = EXCLUDED."example_sentence_ja";

UPDATE "user_answers"
SET "mode_code" = CASE
    WHEN "mode_code" IS NOT NULL THEN "mode_code"
    WHEN "mode"::text = 'default' THEN 'sentence'
    ELSE "mode"::text
END;

UPDATE "question_statistics"
SET "mode_code" = CASE
    WHEN "mode_code" IS NOT NULL THEN "mode_code"
    WHEN "mode"::text = 'default' THEN 'sentence'
    ELSE COALESCE("mode"::text, 'aggregate')
END;

UPDATE "user_answers" ua
SET "content_type_id" = q."content_type_id"
FROM "questions" q
WHERE ua."question_id" = q."id";

UPDATE "question_statistics" qs
SET "content_type_id" = q."content_type_id"
FROM "questions" q
WHERE qs."question_id" = q."id";

UPDATE "user_answers" ua
SET "study_mode_id" = sm."id"
FROM "study_modes" sm
WHERE ua."mode_code" = sm."code";

UPDATE "question_statistics" qs
SET "study_mode_id" = sm."id"
FROM "study_modes" sm
WHERE qs."mode_code" = sm."code";

DROP INDEX IF EXISTS "idx_questions_type";
DROP INDEX IF EXISTS "uq_question_statistics_user_question_mode";

ALTER TABLE "questions"
    DROP COLUMN IF EXISTS "question_type";

ALTER TABLE "user_answers"
    DROP COLUMN IF EXISTS "mode";

ALTER TABLE "question_statistics"
    DROP COLUMN IF EXISTS "mode";

DROP TYPE IF EXISTS "study_mode";
DROP TYPE IF EXISTS "question_statistics_mode";

ALTER TABLE "materials"
    ALTER COLUMN "content_type_id" SET NOT NULL;

ALTER TABLE "chapters"
    ALTER COLUMN "content_type_id" SET NOT NULL;

ALTER TABLE "units"
    ALTER COLUMN "content_type_id" SET NOT NULL;

ALTER TABLE "questions"
    ALTER COLUMN "content_type_id" SET NOT NULL,
    ALTER COLUMN "question_variant" SET NOT NULL;

ALTER TABLE "user_answers"
    ALTER COLUMN "content_type_id" SET NOT NULL,
    ALTER COLUMN "study_mode_id" SET NOT NULL,
    ALTER COLUMN "mode_code" SET NOT NULL;

ALTER TABLE "question_statistics"
    ALTER COLUMN "content_type_id" SET NOT NULL,
    ALTER COLUMN "mode_code" SET NOT NULL;

DO $$
BEGIN
    ALTER TABLE "content_type_study_modes"
        ADD CONSTRAINT "content_type_study_modes_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id") ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "content_type_study_modes"
        ADD CONSTRAINT "content_type_study_modes_study_mode_id_fkey"
        FOREIGN KEY ("study_mode_id") REFERENCES "study_modes"("id") ON DELETE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "materials"
        ADD CONSTRAINT "materials_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "chapters"
        ADD CONSTRAINT "chapters_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "units"
        ADD CONSTRAINT "units_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "questions"
        ADD CONSTRAINT "questions_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "user_answers"
        ADD CONSTRAINT "user_answers_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "user_answers"
        ADD CONSTRAINT "user_answers_study_mode_id_fkey"
        FOREIGN KEY ("study_mode_id") REFERENCES "study_modes"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "question_statistics"
        ADD CONSTRAINT "question_statistics_content_type_id_fkey"
        FOREIGN KEY ("content_type_id") REFERENCES "content_types"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "question_statistics"
        ADD CONSTRAINT "question_statistics_study_mode_id_fkey"
        FOREIGN KEY ("study_mode_id") REFERENCES "study_modes"("id");
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_question_statistics_user_question_mode"
    ON "question_statistics" ("user_id", "question_id", "mode_code");

CREATE INDEX IF NOT EXISTS "idx_question_statistics_user"
    ON "question_statistics" ("user_id");

CREATE INDEX IF NOT EXISTS "idx_question_statistics_question"
    ON "question_statistics" ("question_id");

CREATE INDEX IF NOT EXISTS "idx_question_statistics_mode"
    ON "question_statistics" ("study_mode_id");

CREATE INDEX IF NOT EXISTS "idx_questions_type"
    ON "questions" ("content_type_id", "question_variant");
