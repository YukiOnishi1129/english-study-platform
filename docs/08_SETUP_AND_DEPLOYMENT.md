# セットアップ・デプロイガイド

## 前提条件

### 必須ツール
- Node.js 22以上
- pnpm 9以上
- Docker & Docker Compose
- Git
- Google Cloudアカウント

### 推奨ツール
- VSCode
- Biome拡張機能
- Drizzle Studio

## 初期セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd english-study-platform
```

### 2. 依存関係のインストール

```bash
pnpm install
```

これにより全てのワークスペース（packages、web/admin、web/client）の依存関係がインストールされます。

### 3. 環境変数の設定

#### packages/.env の作成

```bash
cd packages
cp .env.example .env
```

内容を編集：
```env
# ローカル開発用
DB_DRIVER=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_study_db
DB_USER=postgres
DB_PASSWORD=postgres
```

#### web/admin/.env.local の作成

```bash
cd ../web/admin
cp .env.example .env.local
```

内容を編集：
```env
# Google OAuth（必須）
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key # openssl rand -hex 32 で生成

# Database（packages/.envと同じ値）
DB_DRIVER=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_study_db
DB_USER=postgres
DB_PASSWORD=postgres
```

### 4. Google OAuth の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「認証情報」
4. 「認証情報を作成」→「OAuth クライアント ID」
5. 設定：
   - アプリケーションの種類：ウェブアプリケーション
   - 承認済みのリダイレクトURI：
     - `http://localhost:3000/api/auth/callback/google`（開発）
     - `https://your-domain.com/api/auth/callback/google`（本番）

### 5. データベースのセットアップ

#### PostgreSQLの起動

```bash
# プロジェクトルートで実行
make docker-up
```

#### マイグレーションの実行

```bash
cd packages
pnpm db:generate  # マイグレーションファイル生成
pnpm db:migrate   # マイグレーション適用
```

#### Drizzle Studio（オプション）

```bash
pnpm db:studio
```

http://localhost:4983 でアクセス可能

### 6. 管理者ユーザーの作成

管理画面は登録機能がないため、手動で管理者を作成する必要があります。

1. Drizzle Studioを開く
2. `accounts`テーブルに移動
3. 新しいレコードを挿入：

```sql
INSERT INTO accounts (
  email,
  first_name,
  last_name,
  role,
  provider,
  provider_account_id
) VALUES (
  'your-email@gmail.com',
  'Your',
  'Name',
  'admin',
  'google',
  '' -- 初回ログイン時に自動更新される
);
```

### 7. 開発サーバーの起動

```bash
cd web/admin
pnpm dev
```

http://localhost:3000 でアクセス可能

## 本番環境へのデプロイ

### 1. Neon データベースのセットアップ

1. [neon.tech](https://neon.tech) でアカウント作成
2. 新しいデータベースを作成
3. 接続文字列をコピー

### 2. Google Cloud の準備

#### 必要なAPIを有効化

```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com
```

#### Artifact Registry の作成

```bash
gcloud artifacts repositories create english-study-platform \
  --repository-format=docker \
  --location=asia-northeast1
```

#### サービスアカウントの作成

```bash
# サービスアカウント作成
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# 必要な権限を付与
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# キーの作成
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com
```

### 3. GitHub Secrets の設定

以下のシークレットをGitHubリポジトリに追加：

| Secret Name | Description | Example |
|------------|-------------|---------|
| GCP_PROJECT_ID | GCPプロジェクトID | my-project-123 |
| GCP_SA_KEY | サービスアカウントキー（JSON） | key.jsonの内容 |
| DATABASE_URL | Neon接続文字列 | postgresql://... |
| GOOGLE_ID | Google OAuth Client ID | xxx.apps.googleusercontent.com |
| GOOGLE_SECRET | Google OAuth Secret | xxx |
| NEXTAUTH_URL | 本番URL | https://admin.example.com |
| NEXTAUTH_SECRET | 本番用シークレット | openssl rand -hex 32 |

### 4. デプロイの実行

mainブランチにpushすると自動デプロイされます：

```bash
git push origin main
```

## 運用コマンド集

### データベース操作

```bash
# Docker操作
make docker-up        # PostgreSQL起動
make docker-down      # PostgreSQL停止
make docker-logs      # ログ確認
make db-reset        # データベースリセット

# マイグレーション（packagesディレクトリで実行）
pnpm db:generate     # マイグレーション生成
pnpm db:migrate      # マイグレーション適用
pnpm db:studio       # Drizzle Studio起動
```

### 開発コマンド

```bash
# 開発サーバー
pnpm dev            # 開発サーバー起動
pnpm build          # ビルド
pnpm start          # プロダクションモード起動

# コード品質
pnpm lint           # Lintチェック
pnpm lint:fix       # Lint自動修正
pnpm type-check     # 型チェック
```

### パッケージ操作

```bash
# 特定パッケージのコマンド実行
pnpm --filter @acme/shared build
pnpm --filter admin dev
pnpm --filter admin build

# 全パッケージのクリーン
pnpm clean
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. データベース接続エラー

**症状**: `ECONNREFUSED 127.0.0.1:5432`

**解決方法**:
```bash
# Dockerが起動しているか確認
docker ps

# PostgreSQLコンテナのログ確認
docker logs postgres

# 再起動
make docker-down
make docker-up
```

#### 2. ビルドエラー

**症状**: `Module not found` エラー

**解決方法**:
```bash
# 依存関係の再インストール
pnpm clean
pnpm install

# Next.jsキャッシュのクリア
rm -rf web/admin/.next
```

#### 3. 認証エラー

**症状**: Googleログインが失敗する

**確認事項**:
- Google OAuth設定のリダイレクトURIが正しいか
- NEXTAUTH_URLが現在のURLと一致するか
- GOOGLE_ID/SECRETが正しく設定されているか

#### 4. マイグレーションエラー

**症状**: `relation already exists` エラー

**解決方法**:
```bash
# データベースをリセット
make db-reset

# マイグレーション再実行
cd packages
pnpm db:migrate
```

### デバッグ方法

#### 環境変数の確認

```bash
# 環境変数が読み込まれているか確認
cd web/admin
pnpm dev
# コンソールログで確認
```

#### データベース接続テスト

```bash
# psqlで直接接続
psql -h localhost -U postgres -d english_study_db
```

#### Cloud Runログ確認

```bash
# 最新のログを表示
gcloud run services logs read admin --region=asia-northeast1 --limit=50
```

## メンテナンス

### 定期的なタスク

1. **依存関係の更新**（月1回推奨）
   ```bash
   pnpm update --interactive --latest
   ```

2. **セキュリティ監査**（週1回推奨）
   ```bash
   pnpm audit
   ```

3. **データベースバックアップ**（日次推奨）
   - Neon: 自動バックアップ機能を利用
   - ローカル: pg_dumpを使用

### パフォーマンス監視

1. **Cloud Run メトリクス**
   - CPU使用率
   - メモリ使用率
   - レスポンスタイム

2. **データベース監視**
   - クエリパフォーマンス
   - 接続数
   - ストレージ使用量

## 災害復旧

### バックアップ戦略

1. **コード**: GitHubで管理
2. **データベース**: 
   - Neon: Point-in-time recovery対応
   - 定期的なエクスポート推奨
3. **環境変数**: Secret Managerでバックアップ

### 復旧手順

1. **データベース復旧**
   ```bash
   # Neonの管理画面から復旧
   # または、バックアップから復元
   psql DATABASE_URL < backup.sql
   ```

2. **アプリケーション再デプロイ**
   ```bash
   # 手動デプロイ
   gcloud run deploy admin \
     --image=asia-northeast1-docker.pkg.dev/PROJECT_ID/english-study-platform/admin:latest \
     --region=asia-northeast1
   ```