DO $$
BEGIN
  CREATE TYPE study_mode AS ENUM ('jp_to_en', 'en_to_jp', 'sentence', 'default');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE user_answers
ADD COLUMN IF NOT EXISTS mode study_mode NOT NULL DEFAULT 'default';

DO $$
BEGIN
  CREATE TYPE question_statistics_mode AS ENUM (
    'aggregate',
    'jp_to_en',
    'en_to_jp',
    'sentence',
    'default'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE question_statistics
ADD COLUMN IF NOT EXISTS mode question_statistics_mode NOT NULL DEFAULT 'aggregate';

UPDATE question_statistics
SET mode = 'aggregate'
WHERE mode IS NULL;

DROP INDEX IF EXISTS uq_question_statistics_user_question;

CREATE UNIQUE INDEX IF NOT EXISTS uq_question_statistics_user_question_mode
  ON question_statistics (user_id, question_id, mode);
