# テーブル設計

### データベース: PostgreSQL (Neon / Docker)

### ORM: Drizzle ORM

### 認証: next-auth v4 (JWT strategy, cookie-based)

---

## 1. ユーザー・認証関連

### accounts テーブル

ユーザーアカウント情報（next-authのUserとAccountを統合）

```
カラム名型制約説明idUUIDPRIMARY KEYアカウントIDemailVARCHAR(255)NOT NULL, UNIQUEメールアドレスnameVARCHAR(255)NOT NULLユーザー名roleVARCHAR(20)NOT NULL, DEFAULT 'user'ロール (admin/user)providerVARCHAR(50)NOT NULL認証プロバイダー (google)provider_account_idVARCHAR(255)NOT NULLプロバイダーのアカウントIDcreated_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

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

```
カラム名型制約説明idUUIDPRIMARY KEY教材IDnameVARCHAR(255)NOT NULL教材名descriptionTEXTNULL説明orderINTEGERNOT NULL, DEFAULT 0表示順created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

**インデックス:**

- `idx_materials_order` ON (order)

---

### chapters テーブル

章（階層構造を持つ）

```
カラム名型制約説明idUUIDPRIMARY KEY章IDmaterial_idUUIDNOT NULL, FOREIGN KEY教材IDparent_chapter_idUUIDNULL, FOREIGN KEY親章ID（nullならルート）nameVARCHAR(255)NOT NULL章名descriptionTEXTNULL説明orderINTEGERNOT NULL, DEFAULT 0同じ親配下での表示順levelINTEGERNOT NULL階層の深さ (1, 2, 3...)created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

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

```
カラム名型制約説明idUUIDPRIMARY KEYユニットIDchapter_idUUIDNOT NULL, FOREIGN KEY章IDnameVARCHAR(255)NOT NULLユニット名descriptionTEXTNULL説明orderINTEGERNOT NULL, DEFAULT 0表示順created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

**インデックス:**

- `idx_units_chapter_id` ON (chapter_id)
- `idx_units_order` ON (chapter_id, order)

**外部キー:**

- `chapter_id` REFERENCES chapters(id) ON DELETE CASCADE

---

### questions テーブル

問題

```
カラム名型制約説明idUUIDPRIMARY KEY問題IDunit_idUUIDNOT NULL, FOREIGN KEYユニットIDjapaneseTEXTNOT NULL日本語文hintTEXTNULLヒントexplanationTEXTNULL解説orderINTEGERNOT NULL, DEFAULT 0表示順created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

**インデックス:**

- `idx_questions_unit_id` ON (unit_id)
- `idx_questions_order` ON (unit_id, order)

**外部キー:**

- `unit_id` REFERENCES units(id) ON DELETE CASCADE

---

### correct_answers テーブル

正解（複数登録可能）

```
カラム名型制約説明idUUIDPRIMARY KEY正解IDquestion_idUUIDNOT NULL, FOREIGN KEY問題IDanswer_textTEXTNOT NULL英語正解文orderINTEGERNOT NULL, DEFAULT 1表示順（優先順位）created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

**インデックス:**

- `idx_correct_answers_question_id` ON (question_id)
- `idx_correct_answers_order` ON (question_id, order)

**外部キー:**

- `question_id` REFERENCES questions(id) ON DELETE CASCADE

**制約:**

- CHECK (order > 0)
- UNIQUE (question_id, order)

---

## 3. 学習記録関連

### user_answers テーブル

ユーザーの解答履歴

```
カラム名型制約説明idUUIDPRIMARY KEY解答IDuser_idUUIDNOT NULL, FOREIGN KEYユーザーIDquestion_idUUIDNOT NULL, FOREIGN KEY問題IDuser_answer_textTEXTNOT NULLユーザーが入力した英語is_correctBOOLEANNOT NULL正解/不正解is_manually_markedBOOLEANNOT NULL, DEFAULT FALSE手動で正解にしたかanswered_atTIMESTAMPNOT NULL解答日時created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時
```

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

```
カラム名型制約説明idUUIDPRIMARY KEY統計IDuser_idUUIDNOT NULL, FOREIGN KEYユーザーIDquestion_idUUIDNOT NULL, FOREIGN KEY問題IDtotal_attemptsINTEGERNOT NULL, DEFAULT 0総解答回数correct_countINTEGERNOT NULL, DEFAULT 0正解回数incorrect_countINTEGERNOT NULL, DEFAULT 0不正解回数last_attempted_atTIMESTAMPNULL最終解答日時created_atTIMESTAMPNOT NULL, DEFAULT NOW()作成日時updated_atTIMESTAMPNOT NULL, DEFAULT NOW()更新日時
```

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

### 2. 教材関連（5テーブル）

- **materials** - 教材
- **chapters** - 章（階層構造）
- **units** - ユニット
- **questions** - 問題
- **correct_answers** - 正解

### 3. 学習記録関連（3テーブル）

- **user_answers** - ユーザー解答履歴
- **question_statistics** - 問題統計
- **daily_study_logs** - 日次学習ログ

**合計: 9テーブル**

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
questions (1) ----< (N) user_answers
questions (1) ----< (N) question_statistics`

---

## マイグレーション戦略

### 初期マイグレーション順序

1. accounts
2. materials
3. chapters（自己参照の外部キーは後で追加）
4. units
5. questions
6. correct_answers
7. user_answers
8. question_statistics
9. daily_study_logs

### Drizzle ORMでの実装方針

- スキーマ定義を `src/db/schema/` 配下にドメインごとに分割
    - `src/db/schema/accounts.ts`
    - `src/db/schema/materials.ts`
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