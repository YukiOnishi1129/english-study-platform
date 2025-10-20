# Monorepo アーキテクチャ詳細

## 技術スタック

### Core Technologies
- **Framework**: Next.js 15.5.6 (App Router)
- **Language**: TypeScript 5.x
- **Package Manager**: pnpm 9.x (workspaces)
- **Runtime**: Node.js 22.x

### Database & ORM
- **Database**: PostgreSQL 16 (ローカル) / Neon (本番)
- **ORM**: Drizzle ORM 0.38.x
- **Migration**: Drizzle Kit

### Authentication & Security
- **Auth**: NextAuth.js v4 (Google OAuth専用)
- **Session**: JWT戦略
- **Middleware**: 認証保護

### Development & Quality
- **Linting/Formatting**: Biome
- **Git Hooks**: なし（CI/CDで実施）
- **Testing**: 未実装（将来対応）

### Deployment & Infrastructure
- **Platform**: Google Cloud Run
- **Registry**: Artifact Registry
- **CI/CD**: GitHub Actions
- **Container**: Docker

## アーキテクチャパターン

### 1. Domain-Driven Design (DDD)

```
packages/src/
├── domain/              # ドメイン層（ビジネスロジック）
│   ├── entities/        # エンティティ（ビジネスオブジェクト）
│   │   ├── Account.ts   # 例：Accountエンティティ
│   │   └── ...         
│   └── repository/      # リポジトリインターフェース（抽象）
│       ├── AccountRepository.ts
│       └── ...
│
└── db/                  # インフラ層（データアクセス）
    └── repositories/    # リポジトリ実装（具体）
        ├── account.repository.ts
        └── ...
```

**特徴**:
- エンティティはビジネスロジックを持つ
- リポジトリインターフェースで抽象化
- インフラ層の変更がドメイン層に影響しない

### 2. CQRS Pattern

web/admin アプリケーションでのCQRS実装：

```
external/
├── handler/
│   ├── auth/
│   │   ├── auth.command.server.ts  # 書き込み操作
│   │   └── auth.query.server.ts    # 読み取り操作
│   └── ...
└── service/
    ├── account/
    │   └── account.service.ts       # ビジネスロジック
    └── ...
```

**特徴**:
- Command: 状態を変更する操作（create, update, delete）
- Query: データを取得する操作（read）
- Service層でビジネスロジックを実装

### 3. Repository Pattern

```typescript
// インターフェース（ドメイン層）
export interface AccountRepository {
  findById(id: string): Promise<Account | null>;
  save(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}

// 実装（インフラ層）
export class AccountRepositoryImpl implements AccountRepository {
  async findById(id: string): Promise<Account | null> {
    // Drizzle ORMを使用したDB操作
  }
}
```

## 共有パッケージ構造

### パッケージ構成

```json
{
  "name": "@acme/shared",
  "type": "module",
  "exports": {
    "./db": "./src/db/index.ts",
    "./domain": "./src/domain/index.ts"
  }
}
```

### エクスポート例

```typescript
// DBモジュールの使用
import { 
  db,
  AccountRepositoryImpl,
  MaterialRepositoryImpl 
} from "@acme/shared/db";

// ドメインモジュールの使用
import { 
  Account,
  Material,
  type AccountRepository 
} from "@acme/shared/domain";
```

## データベース設計

### 接続戦略

```typescript
// 環境に応じた接続切り替え
if (DB_DRIVER === "local") {
  // PostgreSQL (pg driver)
  const pool = new Pool({ ... });
  return drizzlePg(pool, { schema });
} else {
  // Neon (serverless driver)
  const sql = neon(DATABASE_URL);
  return drizzleNeon(sql, { schema });
}
```

### スキーマ定義例

```typescript
// accounts.ts
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").notNull().$type<"admin" | "user">(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  thumbnail: text("thumbnail"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

## 開発ワークフロー

### 1. 新機能開発フロー

```bash
# 1. フィーチャーブランチ作成
git checkout -b feature/new-feature

# 2. ドメインエンティティ作成（必要な場合）
# packages/src/domain/entities/NewEntity.ts

# 3. スキーマ定義（必要な場合）
# packages/src/db/schema/new-entity.ts

# 4. マイグレーション生成・適用
cd packages
pnpm db:generate
pnpm db:migrate

# 5. リポジトリ実装
# packages/src/db/repositories/new-entity.repository.ts

# 6. アプリケーション側で使用
cd ../web/admin
pnpm dev
```

### 2. パッケージ更新フロー

```bash
# パッケージをビルド
pnpm --filter @acme/shared build

# 型チェック
pnpm --filter @acme/shared type-check

# Lint実行
pnpm --filter @acme/shared lint:fix

# 使用側のアプリを再起動
# (開発中はホットリロードで自動反映)
```

### 3. CI/CDパイプライン

#### packages-ci.yml
- トリガー: packages/ 配下の変更
- 実行内容:
  - 依存関係インストール
  - Biome linting
  - TypeScript型チェック

#### admin-deploy.yml / client-deploy.yml
- トリガー: mainブランチへのpush
- 実行内容:
  1. Dockerイメージビルド
  2. Artifact Registryへpush
  3. Cloud Runへデプロイ
  4. 環境変数の自動設定

## ベストプラクティス

### 1. インポートパス

```typescript
// ❌ 悪い例：相対パス
import { Account } from "../../../packages/src/domain/entities/Account";

// ✅ 良い例：パッケージ名
import { Account } from "@acme/shared/domain";
```

### 2. 型安全性

```typescript
// ❌ 悪い例：non-null assertion
const value = process.env.SOME_VAR!;

// ✅ 良い例：適切なバリデーション
const value = process.env.SOME_VAR || "";
if (!value) {
  throw new Error("SOME_VAR is required");
}
```

### 3. エラーハンドリング

```typescript
// リポジトリ実装での例
async save(entity: Entity): Promise<Entity> {
  const [result] = await db
    .insert(table)
    .values(data)
    .returning();
  
  if (!result) {
    throw new Error("Failed to save entity");
  }
  
  return new Entity(result);
}
```

## セキュリティ考慮事項

### 1. 環境変数
- 本番環境ではSecret Managerを使用
- .env.localファイルは絶対にコミットしない
- CI/CDではGitHub Secretsを使用

### 2. 認証・認可
- 管理画面：roleが"admin"のユーザーのみアクセス可
- セッション：HTTPOnlyクッキーで管理
- CSRF対策：NextAuth.jsで自動実装

### 3. データベース
- 接続情報は環境変数で管理
- SSLは本番環境で必須
- プリペアドステートメント使用（Drizzle ORM）

## トラブルシューティング

### よくある問題

1. **パッケージの変更が反映されない**
   ```bash
   # キャッシュクリア
   pnpm clean
   pnpm install
   ```

2. **型エラーが解決しない**
   ```bash
   # TypeScript再起動
   # VSCode: Cmd+Shift+P → "TypeScript: Restart TS Server"
   ```

3. **マイグレーションエラー**
   ```bash
   # DBリセット
   make db-reset
   cd packages && pnpm db:migrate
   ```

## 今後の拡張計画

1. **テスト基盤**
   - Vitest導入
   - Testing Library
   - E2Eテスト（Playwright）

2. **パフォーマンス最適化**
   - Redis導入（キャッシュ）
   - Edge Functions活用
   - 画像最適化

3. **監視・運用**
   - OpenTelemetry
   - エラートラッキング
   - ログ集約

4. **国際化**
   - next-intl導入
   - 多言語サポート