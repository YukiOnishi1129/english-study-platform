ALTER TABLE "accounts"
  ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "last_login_at" timestamp,
  ALTER COLUMN "first_name" DROP NOT NULL,
  ALTER COLUMN "last_name" DROP NOT NULL;

CREATE TABLE IF NOT EXISTS "account_role_histories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
  "previous_role" varchar(20) NOT NULL CHECK ("previous_role" IN ('admin', 'user')),
  "next_role" varchar(20) NOT NULL CHECK ("next_role" IN ('admin', 'user')),
  "changed_by_account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE RESTRICT,
  "changed_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_account_role_histories_account"
  ON "account_role_histories" ("account_id", "changed_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_account_role_histories_changed_by"
  ON "account_role_histories" ("changed_by_account_id");

CREATE TABLE IF NOT EXISTS "account_status_histories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
  "previous_status" varchar(10) NOT NULL CHECK ("previous_status" IN ('active', 'inactive')),
  "next_status" varchar(10) NOT NULL CHECK ("next_status" IN ('active', 'inactive')),
  "changed_by_account_id" uuid NOT NULL REFERENCES "accounts"("id") ON DELETE RESTRICT,
  "changed_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_account_status_histories_account"
  ON "account_status_histories" ("account_id", "changed_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_account_status_histories_changed_by"
  ON "account_status_histories" ("changed_by_account_id");

