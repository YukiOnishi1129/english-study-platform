# テーブル設計

### データベース: PostgreSQL (Neon / Docker)

### ORM: Drizzle ORM

### 認証: next-auth v4 (JWT strategy, cookie-based)

---

## 1. ユーザー・認証関連

### accounts テーブル

ユーザーアカウント情報（next-authのUserとAccountを統合）

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | アカウントID |
| email | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| name | VARCHAR(255) | NOT NULL | ユーザー名 |
| role | VARCHAR(20) | NOT NULL, DEFAULT 'user' | ロール (admin/user) |
| provider | VARCHAR(50) | NOT NULL | 認証プロバイダー (google) |
| provider_account_id | VARCHAR(255) | NOT NULL | プロバイダーのアカウントID |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_accounts_email` ON (email)
- `idx_accounts_provider` ON (provider, provider_account_id)
- `idx_accounts_role` ON (role)

**制約:**

- UNIQUE (provider, provider_account_id)
- CHECK (role IN ('admin', 'user'))

**補足:**

- next-authはJWT戦略を使用し、セッション情報はcookieで管理
- token情報（accessToken, idToken, refreshToken）もcookieで管理し、DBには保存しない

---

## 2. 教材関連

### materials テーブル

教材の基本情報

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 教材ID |
| name | VARCHAR(255) | NOT NULL | 教材名 |
| description | TEXT | NULL | 説明 |
| order | INTEGER | NOT NULL, DEFAULT 0 | 表示順 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_materials_order` ON (order)

---

### chapters テーブル

章（階層構造を持つ）

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 章ID |
| material_id | UUID | NOT NULL, FOREIGN KEY | 教材ID |
| parent_chapter_id | UUID | NULL, FOREIGN KEY | 親章ID（nullならルート） |
| name | VARCHAR(255) | NOT NULL | 章名 |
| description | TEXT | NULL | 説明 |
| order | INTEGER | NOT NULL, DEFAULT 0 | 同じ親配下での表示順 |
| level | INTEGER | NOT NULL | 階層の深さ (1, 2, 3...) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_chapters_material_id` ON (material_id)
- `idx_chapters_parent_id` ON (parent_chapter_id)
- `idx_chapters_order` ON (material_id, parent_chapter_id, order)
- `idx_chapters_level` ON (level)

**外部キー:**

- `material_id` REFERENCES materials(id) ON DELETE CASCADE
- `parent_chapter_id` REFERENCES chapters(id) ON DELETE CASCADE

**制約:**

- CHECK (level > 0)

---

### units テーブル

ユニット（学習の最小単位）

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | ユニットID |
| chapter_id | UUID | NOT NULL, FOREIGN KEY | 章ID |
| name | VARCHAR(255) | NOT NULL | ユニット名 |
| description | TEXT | NULL | 説明 |
| order | INTEGER | NOT NULL, DEFAULT 0 | 表示順 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_units_chapter_id` ON (chapter_id)
- `idx_units_order` ON (chapter_id, order)

**外部キー:**

- `chapter_id` REFERENCES chapters(id) ON DELETE CASCADE

---

### questions テーブル

問題

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 問題ID |
| unit_id | UUID | NOT NULL, FOREIGN KEY | ユニットID |
| japanese | TEXT | NOT NULL | 日本語文 |
| prompt | TEXT | NULL | 追加の指示文（語彙モード等） |
| hint | TEXT | NULL | ヒント |
| explanation | TEXT | NULL | 解説 |
| question_type | VARCHAR(30) | NOT NULL, DEFAULT 'phrase' | 出題タイプ（語彙モード判定） |
| vocabulary_entry_id | UUID | NULL, FOREIGN KEY | 語彙エントリID（語彙教材のみ） |
| order | INTEGER | NOT NULL, DEFAULT 0 | 表示順 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_questions_unit_id` ON (unit_id)
- `idx_questions_order` ON (unit_id, order)
- `idx_questions_vocabulary_entry` ON (vocabulary_entry_id)
- `idx_questions_type` ON (question_type)

**外部キー:**

- `unit_id` REFERENCES units(id) ON DELETE CASCADE
- `vocabulary_entry_id` REFERENCES vocabulary_entries(id) ON DELETE SET NULL

**制約:**

- CHECK (question_type IN ('phrase', 'jp_to_en', 'en_to_jp', 'cloze', 'free_sentence'))
- 語彙系のquestion_typeではvocabulary_entry_id IS NOT NULL（アプリケーション層で担保）

---

### correct_answers テーブル

正解（複数登録可能）

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 正解ID |
| question_id | UUID | NOT NULL, FOREIGN KEY | 問題ID |
| answer_text | TEXT | NOT NULL | 英語正解文 |
| order | INTEGER | NOT NULL, DEFAULT 1 | 表示順（優先順位） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_correct_answers_question_id` ON (question_id)
- `idx_correct_answers_order` ON (question_id, order)

**外部キー:**

- `question_id` REFERENCES questions(id) ON DELETE CASCADE

**制約:**

- CHECK (order > 0)
- UNIQUE (question_id, order)

---

### vocabulary_entries テーブル

語彙教材用の語彙エントリ

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 語彙ID |
| material_id | UUID | NOT NULL, FOREIGN KEY | 教材ID |
| headword | VARCHAR(255) | NOT NULL | 見出し語（英単語） |
| pronunciation | VARCHAR(255) | NULL | 発音記号・読み |
| part_of_speech | VARCHAR(50) | NULL | 品詞 |
| definition_ja | TEXT | NOT NULL | 日本語定義 |
| memo | TEXT | NULL | 補足情報 |
| example_sentence_en | TEXT | NULL | 例文（英語） |
| example_sentence_ja | TEXT | NULL | 例文（日本語訳） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_vocabulary_entries_material_id` ON (material_id)
- `idx_vocabulary_entries_headword` ON (material_id, headword)

**外部キー:**

- `material_id` REFERENCES materials(id) ON DELETE CASCADE

---

### vocabulary_relations テーブル

類義語・対義語などの関連語

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 関連語ID |
| vocabulary_entry_id | UUID | NOT NULL, FOREIGN KEY | 語彙ID |
| relation_type | VARCHAR(20) | NOT NULL | 関係タイプ（synonym/antonym/related） |
| related_text | VARCHAR(255) | NOT NULL | 関連語 |
| note | TEXT | NULL | 補足 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_vocabulary_relations_entry` ON (vocabulary_entry_id)
- `idx_vocabulary_relations_type` ON (relation_type)

**外部キー:**

- `vocabulary_entry_id` REFERENCES vocabulary_entries(id) ON DELETE CASCADE

**制約:**

- CHECK (relation_type IN ('synonym', 'antonym', 'related'))

---

## 3. 学習記録関連

### user_answers テーブル

ユーザーの解答履歴

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 解答ID |
| user_id | UUID | NOT NULL, FOREIGN KEY | ユーザーID |
| question_id | UUID | NOT NULL, FOREIGN KEY | 問題ID |
| user_answer_text | TEXT | NOT NULL | ユーザーが入力した英語 |
| is_correct | BOOLEAN | NOT NULL | 正解/不正解 |
| is_manually_marked | BOOLEAN | NOT NULL, DEFAULT FALSE | 手動で正解にしたか |
| answered_at | TIMESTAMP | NOT NULL | 解答日時 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |

**インデックス:**

- `idx_user_answers_user_id` ON (user_id)
- `idx_user_answers_question_id` ON (question_id)
- `idx_user_answers_answered_at` ON (answered_at DESC)
- `idx_user_answers_user_question` ON (user_id, question_id, answered_at DESC)

**外部キー:**

- `user_id` REFERENCES accounts(id) ON DELETE CASCADE
- `question_id` REFERENCES questions(id) ON DELETE CASCADE

---

### question_statistics テーブル

問題ごとの統計情報（ユーザーごと）

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | 統計ID |
| user_id | UUID | NOT NULL, FOREIGN KEY | ユーザーID |
| question_id | UUID | NOT NULL, FOREIGN KEY | 問題ID |
| total_attempts | INTEGER | NOT NULL, DEFAULT 0 | 総解答回数 |
| correct_count | INTEGER | NOT NULL, DEFAULT 0 | 正解回数 |
| incorrect_count | INTEGER | NOT NULL, DEFAULT 0 | 不正解回数 |
| last_attempted_at | TIMESTAMP | NULL | 最終解答日時 |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_question_statistics_user_id` ON (user_id)
- `idx_question_statistics_question_id` ON (question_id)
- `idx_question_statistics_last_attempted` ON (last_attempted_at DESC)

**外部キー:**

- `user_id` REFERENCES accounts(id) ON DELETE CASCADE
- `question_id` REFERENCES questions(id) ON DELETE CASCADE

**制約:**

- UNIQUE (user_id, question_id)
- CHECK (total_attempts = correct_count + incorrect_count)
- CHECK (total_attempts >= 0)
- CHECK (correct_count >= 0)
- CHECK (incorrect_count >= 0)

---

### daily_study_logs テーブル

日次学習ログ

| カラム名 | 型 | 制約 | 説明 |
|---------|-------|-------|-------|
| id | UUID | PRIMARY KEY | ログID |
| user_id | UUID | NOT NULL, FOREIGN KEY | ユーザー ID |
| study_date | DATE | NOT NULL | 学習日 |
| total_questions | INTEGER | NOT NULL, DEFAULT 0 | その日に解いた問題数 |
| correct_questions | INTEGER | NOT NULL, DEFAULT 0 | 正解数 |
| study_time_minutes | INTEGER | NOT NULL, DEFAULT 0 | 学習時間（分） |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | 更新日時 |

**インデックス:**

- `idx_daily_study_logs_user_id` ON (user_id)
- `idx_daily_study_logs_study_date` ON (study_date DESC)
- `idx_daily_study_logs_user_date` ON (user_id, study_date DESC)

**外部キー:**

- `user_id` REFERENCES accounts(id) ON DELETE CASCADE

**制約:**

- UNIQUE (user_id, study_date)
- CHECK (total_questions >= 0)
- CHECK (correct_questions >= 0)
- CHECK (correct_questions <= total_questions)
- CHECK (study_time_minutes >= 0)

---

## テーブル一覧まとめ

### 1. ユーザー・認証関連（1テーブル）

- **accounts** - ユーザーアカウント情報

### 2. 教材関連（7テーブル）

- **materials** - 教材
- **chapters** - 章（階層構造）
- **units** - ユニット
- **questions** - 問題
- **correct_answers** - 正解
- **vocabulary_entries** - 語彙エントリ
- **vocabulary_relations** - 類義語・対義語

### 3. 学習記録関連（3テーブル）

- **user_answers** - ユーザー解答履歴
- **question_statistics** - 問題統計
- **daily_study_logs** - 日次学習ログ

**合計: 11テーブル**

---

## ER図の概要

`accounts (1) ----< (N) user_answers
accounts (1) ----< (N) question_statistics
accounts (1) ----< (N) daily_study_logs

materials (1) ----< (N) chapters
chapters (1) ----< (N) chapters (自己参照: parent_chapter_id)
chapters (1) ----< (N) units
units (1) ----< (N) questions
questions (1) ----< (N) correct_answers
materials (1) ----< (N) vocabulary_entries
vocabulary_entries (1) ----< (N) vocabulary_relations
vocabulary_entries (1) ----< (N) questions (語彙教材のみ)
questions (1) ----< (N) user_answers
questions (1) ----< (N) question_statistics`

---

## マイグレーション戦略

### 初期マイグレーション順序

1. accounts
2. materials
3. chapters（自己参照の外部キーは後で追加）
4. units
5. vocabulary_entries
6. questions
7. correct_answers
8. vocabulary_relations
9. user_answers
10. question_statistics
11. daily_study_logs

### Drizzle ORMでの実装方針

- スキーマ定義を `src/db/schema/` 配下にドメインごとに分割
    - `src/db/schema/accounts.ts`
    - `src/db/schema/materials.ts`
    - `src/db/schema/vocabulary.ts`
    - `src/db/schema/study-records.ts`
- `drizzle-kit` でマイグレーションファイル生成
- 本番環境（Neon）とローカル環境（Docker）で `DATABASE_URL` 環境変数を切り替え

---

## next-auth設定方針

### JWTセッション戦略

typescript

`*// next-auth設定（概要）*
{
  session: {
    strategy: "jwt"  *// cookieベースのJWT認証*
  },
  *// sessionsテーブルは使用しない// token情報もcookieで管理*
}`

### 型定義のカスタマイズ

- next-authの `Session` 型に `user.id`, `user.name`, `user.role` を追加
- `useSession()` で取得できるようにする
