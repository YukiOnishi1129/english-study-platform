CREATE TABLE IF NOT EXISTS "user_answers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "user_answer_text" text NOT NULL,
    "is_correct" boolean NOT NULL DEFAULT false,
    "is_manually_marked" boolean NOT NULL DEFAULT false,
    "answered_at" timestamp NOT NULL DEFAULT now(),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "user_answers"
    ADD CONSTRAINT "user_answers_user_id_accounts_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id") ON DELETE CASCADE;

ALTER TABLE "user_answers"
    ADD CONSTRAINT "user_answers_question_id_questions_id_fk"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "idx_user_answers_user" ON "user_answers" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_answers_question" ON "user_answers" ("question_id");

CREATE TABLE IF NOT EXISTS "question_statistics" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "question_id" uuid NOT NULL,
    "total_attempts" integer NOT NULL DEFAULT 0,
    "correct_count" integer NOT NULL DEFAULT 0,
    "incorrect_count" integer NOT NULL DEFAULT 0,
    "last_attempted_at" timestamp,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "question_statistics"
    ADD CONSTRAINT "question_statistics_user_id_accounts_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "accounts"("id") ON DELETE CASCADE;

ALTER TABLE "question_statistics"
    ADD CONSTRAINT "question_statistics_question_id_questions_id_fk"
    FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "uq_question_statistics_user_question"
    ON "question_statistics" ("user_id", "question_id");
CREATE INDEX IF NOT EXISTS "idx_question_statistics_user"
    ON "question_statistics" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_question_statistics_question"
    ON "question_statistics" ("question_id");
