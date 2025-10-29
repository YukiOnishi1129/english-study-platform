CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"thumbnail" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"material_id" uuid NOT NULL,
	"parent_chapter_id" uuid,
	"name" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"level" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "correct_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"answer_text" text NOT NULL,
	"order" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"japanese" text NOT NULL,
	"hint" text,
	"explanation" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"total_attempts" integer DEFAULT 0 NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"last_attempted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"user_answer_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"is_manually_marked" boolean DEFAULT false NOT NULL,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chapters_material_id_materials_id_fk'
  ) THEN
    ALTER TABLE "chapters"
      ADD CONSTRAINT "chapters_material_id_materials_id_fk"
      FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chapters_parent_chapter_id_chapters_id_fk'
  ) THEN
    ALTER TABLE "chapters"
      ADD CONSTRAINT "chapters_parent_chapter_id_chapters_id_fk"
      FOREIGN KEY ("parent_chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'correct_answers_question_id_questions_id_fk'
  ) THEN
    ALTER TABLE "correct_answers"
      ADD CONSTRAINT "correct_answers_question_id_questions_id_fk"
      FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'questions_unit_id_units_id_fk'
  ) THEN
    ALTER TABLE "questions"
      ADD CONSTRAINT "questions_unit_id_units_id_fk"
      FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'units_chapter_id_chapters_id_fk'
  ) THEN
    ALTER TABLE "units"
      ADD CONSTRAINT "units_chapter_id_chapters_id_fk"
      FOREIGN KEY ("chapter_id") REFERENCES "public"."chapters"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'question_statistics_user_id_accounts_id_fk'
  ) THEN
    ALTER TABLE "question_statistics"
      ADD CONSTRAINT "question_statistics_user_id_accounts_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'question_statistics_question_id_questions_id_fk'
  ) THEN
    ALTER TABLE "question_statistics"
      ADD CONSTRAINT "question_statistics_question_id_questions_id_fk"
      FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_answers_user_id_accounts_id_fk'
  ) THEN
    ALTER TABLE "user_answers"
      ADD CONSTRAINT "user_answers_user_id_accounts_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_answers_question_id_questions_id_fk'
  ) THEN
    ALTER TABLE "user_answers"
      ADD CONSTRAINT "user_answers_question_id_questions_id_fk"
      FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END;
$$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_question_statistics_user_question" ON "question_statistics" USING btree ("user_id","question_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_question_statistics_user" ON "question_statistics" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_question_statistics_question" ON "question_statistics" USING btree ("question_id");
