# プロジェクト全体構成

## Monorepo Architecture

このプロジェクトは pnpm workspaces を使用したモノレポ構成になっています。

```
english-study-platform/
├── packages/                    # 共有パッケージ (@acme/shared)
│   ├── src/
│   │   ├── db/                 # データベース層
│   │   │   ├── client.ts       # DB接続（PostgreSQL/Neon切替対応）
│   │   │   ├── schema/         # Drizzle ORMスキーマ定義
│   │   │   └── repositories/   # リポジトリ実装（DDD）
│   │   └── domain/             # ドメイン層（DDD）
│   │       ├── entities/       # ドメインエンティティ
│   │       ├── repository/     # リポジトリインターフェース
│   │       └── value-objects/  # 値オブジェクト
│   ├── migrations/             # データベースマイグレーション
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── web/
│   ├── client/                 # 英語学習アプリ（一般ユーザー向け）
│   │   ├── src/
│   │   ├── package.json
│   │   ├── next.config.js
│   │   ├── tsconfig.json
│   │   └── .env.local
│   │
│   └── admin/                  # 管理画面アプリ（管理者向け）
│       ├── src/
│       ├── package.json
│       ├── next.config.js  
│       ├── tsconfig.json
│       └── .env.local
│
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── admin-deploy.yml    # 管理画面デプロイ
│       ├── client-deploy.yml   # クライアントデプロイ
│       └── packages-ci.yml     # パッケージCI
│
├── docs/                       # プロジェクトドキュメント
├── docker-compose.yml          # ローカル開発用PostgreSQL
├── Makefile                    # 共通コマンド
├── pnpm-workspace.yaml         # ワークスペース設定
└── package.json                # ルートパッケージ設定
```



## 1. 英語学習アプリ（web/client）のディレクトリ構成

```
web/client/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (user)/               # 認証済みユーザー用
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── materials/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [materialId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── chapters/
│   │   │   │           └── [chapterId]/
│   │   │   │               ├── page.tsx
│   │   │   │               └── units/
│   │   │   │                   └── [unitId]/
│   │   │   │                       ├── page.tsx
│   │   │   │                       └── study/
│   │   │   │                           ├── page.tsx
│   │   │   │                           └── loading.tsx
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   │
│   │   └── layout.tsx
│   │
│   ├── features/                 # 機能ごとのドメイン
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   └── LoginPageTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── LoginButton/
│   │   │   │       │   ├── LoginButtonContainer.tsx
│   │   │   │       │   ├── LoginButtonPresenter.tsx
│   │   │   │       │   ├── useLoginButton.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── LogoutButton/
│   │   │   │           ├── LogoutButtonContainer.tsx
│   │   │   │           ├── LogoutButtonPresenter.tsx
│   │   │   │           ├── useLogoutButton.ts
│   │   │   │           └── index.ts
│   │   │   └── utils/
│   │   │       └── requireAuth.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   └── DashboardPageTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── StatsSummary/
│   │   │   │       │   ├── StatsSummaryContainer.tsx
│   │   │   │       │   ├── StatsSummaryPresenter.tsx
│   │   │   │       │   ├── useStatsSummary.ts
│   │   │   │       │   └── index.ts
│   │   │   │       ├── StudyCalendar/
│   │   │   │       │   ├── StudyCalendarContainer.tsx
│   │   │   │       │   ├── StudyCalendarPresenter.tsx
│   │   │   │       │   ├── useStudyCalendar.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── MaterialList/
│   │   │   │           ├── MaterialListContainer.tsx
│   │   │   │           ├── MaterialListPresenter.tsx
│   │   │   │           ├── useMaterialList.ts
│   │   │   │           └── index.ts
│   │   │   └── queries/
│   │   │       ├── keys.ts
│   │   │       └── useDashboardQuery.ts
│   │   │
│   │   ├── materials/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   ├── MaterialListPageTemplate.tsx
│   │   │   │   │   ├── MaterialDetailPageTemplate.tsx
│   │   │   │   │   ├── ChapterDetailPageTemplate.tsx
│   │   │   │   │   └── UnitDetailPageTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── MaterialCard/
│   │   │   │       │   ├── MaterialCardPresenter.tsx
│   │   │   │       │   └── index.ts
│   │   │   │       ├── ChapterTree/
│   │   │   │       │   ├── ChapterTreeContainer.tsx
│   │   │   │       │   ├── ChapterTreePresenter.tsx
│   │   │   │       │   ├── useChapterTree.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── UnitCard/
│   │   │   │           ├── UnitCardPresenter.tsx
│   │   │   │           └── index.ts
│   │   │   └── queries/
│   │   │       ├── keys.ts
│   │   │       ├── useMaterialQuery.ts
│   │   │       ├── useChapterQuery.ts
│   │   │       └── useUnitQuery.ts
│   │   │
│   │   ├── study/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   └── StudyPageTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── QuestionCard/
│   │   │   │       │   ├── QuestionCardPresenter.tsx
│   │   │   │       │   └── index.ts
│   │   │   │       ├── AnswerInput/
│   │   │   │       │   ├── AnswerInputContainer.tsx
│   │   │   │       │   ├── AnswerInputPresenter.tsx
│   │   │   │       │   ├── useAnswerInput.ts
│   │   │   │       │   └── index.ts
│   │   │   │       ├── AnswerResult/
│   │   │   │       │   ├── AnswerResultPresenter.tsx
│   │   │   │       │   └── index.ts
│   │   │   │       ├── StudySession/
│   │   │   │       │   ├── StudySessionContainer.tsx
│   │   │   │       │   ├── StudySessionPresenter.tsx
│   │   │   │       │   ├── useStudySession.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── AudioPlayer/
│   │   │   │           ├── AudioPlayerPresenter.tsx
│   │   │   │           └── index.ts
│   │   │   ├── queries/
│   │   │   │   ├── keys.ts
│   │   │   │   └── useQuestionsQuery.ts
│   │   │   └── utils/
│   │   │       ├── answerValidator.ts
│   │   │       └── questionRandomizer.ts
│   │   │
│   │   └── analytics/
│   │       ├── components/
│   │       │   ├── server/
│   │       │   │   └── AnalyticsPageTemplate.tsx
│   │       │   └── client/
│   │       │       ├── StatisticsCard/
│   │       │       │   ├── StatisticsCardContainer.tsx
│   │       │       │   ├── StatisticsCardPresenter.tsx
│   │       │       │   ├── useStatistics.ts
│   │       │       │   └── index.ts
│   │       │       └── MistakeList/
│   │       │           ├── MistakeListContainer.tsx
│   │       │           ├── MistakeListPresenter.tsx
│   │       │           ├── useMistakeList.ts
│   │       │           └── index.ts
│   │       └── queries/
│   │           ├── keys.ts
│   │           └── useAnalyticsQuery.ts
│   │
│   ├── shared/                   # 共通コンポーネント
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── server/
│   │   │   │   │   └── UserLayoutWrapper.tsx
│   │   │   │   └── client/
│   │   │   │       ├── Header/
│   │   │   │       │   ├── HeaderPresenter.tsx
│   │   │   │       │   └── index.ts
│   │   │   │       └── Sidebar/
│   │   │   │           ├── SidebarPresenter.tsx
│   │   │   │           └── index.ts
│   │   │   └── ui/
│   │   │       ├── Button/
│   │   │       │   ├── Button.tsx
│   │   │       │   └── index.ts
│   │   │       ├── Card/
│   │   │       │   ├── Card.tsx
│   │   │       │   └── index.ts
│   │   │       └── Modal/
│   │   │           ├── Modal.tsx
│   │   │           └── index.ts
│   │   ├── lib/
│   │   │   ├── query-client.ts
│   │   │   ├── auth.ts
│   │   │   └── env.ts
│   │   └── types/
│   │       └── next.ts
│   │
│   └── external/                 # 外部アダプタ層
│       ├── dto/
│       │   ├── auth/
│       │   │   └── types.ts
│       │   ├── material/
│       │   │   ├── types.ts
│       │   │   └── ensureMaterialResponse.ts
│       │   ├── question/
│       │   │   ├── types.ts
│       │   │   └── ensureQuestionResponse.ts
│       │   ├── study/
│       │   │   ├── types.ts
│       │   │   └── ensureAnswerResponse.ts
│       │   └── analytics/
│       │       ├── types.ts
│       │       └── ensureAnalyticsResponse.ts
│       │
│       ├── handler/
│       │   ├── auth/
│       │   │   ├── query.server.ts
│       │   │   └── query.action.ts
│       │   ├── material/
│       │   │   ├── query.server.ts
│       │   │   └── query.action.ts
│       │   ├── question/
│       │   │   ├── query.server.ts
│       │   │   └── query.action.ts
│       │   ├── study/
│       │   │   ├── query.server.ts
│       │   │   ├── query.action.ts
│       │   │   └── mutation.action.ts
│       │   └── analytics/
│       │       ├── query.server.ts
│       │       └── query.action.ts
│       │
│       ├── service/
│       │   ├── AnswerJudgementService.ts
│       │   ├── StudyAnalyticsService.ts
│       │   ├── QuestionRandomizerService.ts
│       │   └── StatisticsAggregationService.ts
│       │
│       ├── repository/
│       │   ├── AccountRepository.ts
│       │   ├── MaterialRepository.ts
│       │   ├── ChapterRepository.ts
│       │   ├── UnitRepository.ts
│       │   ├── QuestionRepository.ts
│       │   ├── CorrectAnswerRepository.ts
│       │   ├── UserAnswerRepository.ts
│       │   ├── QuestionStatisticsRepository.ts
│       │   └── DailyStudyLogRepository.ts
│       │
│       ├── db/
│       │   ├── schema/
│       │   │   ├── accounts.ts
│       │   │   ├── materials.ts
│       │   │   ├── chapters.ts
│       │   │   ├── units.ts
│       │   │   ├── questions.ts
│       │   │   ├── correct-answers.ts
│       │   │   ├── user-answers.ts
│       │   │   ├── question-statistics.ts
│       │   │   └── daily-study-logs.ts
│       │   ├── migrations/
│       │   └── client.ts
│       │
│       └── client/
│           └── text-to-speech/
│               └── GoogleTTSClient.ts
│
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local
└── drizzle.config.ts
```

## 2. 管理画面アプリ（web/admin）のディレクトリ構成

```
web/admin/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (admin)/              # 管理者専用
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── materials/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [materialId]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── import/
│   │   │   │           └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── api/
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts
│   │   │
│   │   └── layout.tsx
│   │
│   ├── features/                 # 機能ごとのドメイン
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   └── LoginPageTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── LoginButton/
│   │   │   │       │   ├── LoginButtonContainer.tsx
│   │   │   │       │   ├── LoginButtonPresenter.tsx
│   │   │   │       │   ├── useLoginButton.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── LogoutButton/
│   │   │   │           ├── LogoutButtonContainer.tsx
│   │   │   │           ├── LogoutButtonPresenter.tsx
│   │   │   │           ├── useLogoutButton.ts
│   │   │   │           └── index.ts
│   │   │   └── utils/
│   │   │       └── requireAdmin.ts
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   └── AdminDashboardTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── SystemStats/
│   │   │   │       │   ├── SystemStatsContainer.tsx
│   │   │   │       │   ├── SystemStatsPresenter.tsx
│   │   │   │       │   ├── useSystemStats.ts
│   │   │   │       │   └── index.ts
│   │   │   │       └── RecentActivity/
│   │   │   │           ├── RecentActivityContainer.tsx
│   │   │   │           ├── RecentActivityPresenter.tsx
│   │   │   │           ├── useRecentActivity.ts
│   │   │   │           └── index.ts
│   │   │   └── queries/
│   │   │       ├── keys.ts
│   │   │       └── useAdminStatsQuery.ts
│   │   │
│   │   ├── materials/
│   │   │   ├── components/
│   │   │   │   ├── server/
│   │   │   │   │   ├── MaterialListTemplate.tsx
│   │   │   │   │   ├── MaterialDetailTemplate.tsx
│   │   │   │   │   └── MaterialEditTemplate.tsx
│   │   │   │   └── client/
│   │   │   │       ├── MaterialForm/
│   │   │   │       │   ├── MaterialFormContainer.tsx
│   │   │   │       │   ├── MaterialFormPresenter.tsx
│   │   │   │       │   ├── useMaterialForm.ts
│   │   │   │       │   └── index.ts
│   │   │   │       ├── MaterialCard/
│   │   │   │       │   ├── MaterialCardPresenter.tsx
│   │   │   │       │   └── index.ts
│   │   │   │       └── MaterialActions/
│   │   │   │           ├── MaterialActionsContainer.tsx
│   │   │   │           ├── MaterialActionsPresenter.tsx
│   │   │   │           ├── useMaterialActions.ts
│   │   │   │           └── index.ts
│   │   │   └── queries/
│   │   │       ├── keys.ts
│   │   │       └── useMaterialQuery.ts
│   │   │
│   │   └── csv-import/
│   │       ├── components/
│   │       │   ├── server/
│   │       │   │   └── CsvImportTemplate.tsx
│   │       │   └── client/
│   │       │       ├── CsvUploader/
│   │       │       │   ├── CsvUploaderContainer.tsx
│   │       │       │   ├── CsvUploaderPresenter.tsx
│   │       │       │   ├── useCsvUploader.ts
│   │       │       │   └── index.ts
│   │       │       ├── CsvPreview/
│   │       │       │   ├── CsvPreviewContainer.tsx
│   │       │       │   ├── CsvPreviewPresenter.tsx
│   │       │       │   ├── useCsvPreview.ts
│   │       │       │   └── index.ts
│   │       │       └── ImportProgress/
│   │       │           ├── ImportProgressPresenter.tsx
│   │       │           └── index.ts
│   │       └── queries/
│   │           ├── keys.ts
│   │           └── useCsvImportQuery.ts
│   │
│   ├── shared/                   # 共通コンポーネント
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── server/
│   │   │   │   │   └── AdminLayoutWrapper.tsx
│   │   │   │   └── client/
│   │   │   │       ├── Header/
│   │   │   │       │   ├── HeaderPresenter.tsx
│   │   │   │       │   └── index.ts
│   │   │   │       └── Sidebar/
│   │   │   │           ├── SidebarPresenter.tsx
│   │   │   │           └── index.ts
│   │   │   └── ui/
│   │   │       ├── Button/
│   │   │       │   ├── Button.tsx
│   │   │       │   └── index.ts
│   │   │       ├── Card/
│   │   │       │   ├── Card.tsx
│   │   │       │   └── index.ts
│   │   │       ├── Modal/
│   │   │       │   ├── Modal.tsx
│   │   │       │   └── index.ts
│   │   │       └── Table/
│   │   │           ├── Table.tsx
│   │   │           └── index.ts
│   │   ├── lib/
│   │   │   ├── query-client.ts
│   │   │   ├── auth.ts
│   │   │   └── env.ts
│   │   └── types/
│   │       └── next.ts
│   │
│   └── external/                 # 外部アダプタ層
│       ├── dto/
│       │   ├── auth/
│       │   │   └── types.ts
│       │   ├── material/
│       │   │   ├── types.ts
│       │   │   └── ensureMaterialResponse.ts
│       │   ├── csv/
│       │   │   ├── types.ts
│       │   │   └── ensureCsvResponse.ts
│       │   └── stats/
│       │       ├── types.ts
│       │       └── ensureStatsResponse.ts
│       │
│       ├── handler/
│       │   ├── auth/
│       │   │   ├── query.server.ts
│       │   │   └── query.action.ts
│       │   ├── material/
│       │   │   ├── query.server.ts
│       │   │   ├── query.action.ts
│       │   │   └── mutation.action.ts
│       │   ├── csv-import/
│       │   │   ├── upload.action.ts
│       │   │   └── import.action.ts
│       │   └── stats/
│       │       ├── query.server.ts
│       │       └── query.action.ts
│       │
│       ├── service/
│       │   ├── CsvImportService.ts
│       │   ├── ChapterTreeBuilderService.ts
│       │   └── MaterialValidationService.ts
│       │
│       ├── repository/
│       │   ├── AccountRepository.ts
│       │   ├── MaterialRepository.ts
│       │   ├── ChapterRepository.ts
│       │   ├── UnitRepository.ts
│       │   ├── QuestionRepository.ts
│       │   └── CorrectAnswerRepository.ts
│       │
│       ├── db/
│       │   ├── schema/
│       │   │   ├── accounts.ts
│       │   │   ├── materials.ts
│       │   │   ├── chapters.ts
│       │   │   ├── units.ts
│       │   │   ├── questions.ts
│       │   │   └── correct-answers.ts
│       │   ├── migrations/
│       │   └── client.ts
│       │
│       └── client/
│           └── csv/
│               └── CsvParserClient.ts
│
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local
└── drizzle.config.ts
```

## 3. 共通設定・環境変数

### 共有パッケージ (packages/)

@acme/shared パッケージとして、以下の2つのモジュールをエクスポートしています：

```typescript
// Database exports
import { db, AccountRepositoryImpl, MaterialRepositoryImpl, ... } from "@acme/shared/db";

// Domain exports  
import { Account, Material, AccountRepository, ... } from "@acme/shared/domain";
```

#### Domain Entities
- Account: ユーザーアカウント（Google OAuth対応）
- Material: 教材
- Chapter: 章（自己参照による階層構造）
- Unit: ユニット
- Question: 問題
- CorrectAnswer: 正解

#### Repository Pattern
各エンティティに対して：
- Repository Interface: `domain/repository/` に定義
- Repository Implementation: `db/repositories/` にDrizzle ORM実装

### 環境変数設定

#### packages/.env (ローカル開発用)
```bash
# Database Configuration
DB_DRIVER=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_study_db
DB_USER=postgres
DB_PASSWORD=postgres
```

#### web/admin/.env.local
```bash
# Database (本番環境はNeon使用)
DATABASE_URL=postgresql://...
DB_DRIVER=neon  # or local

# 個別環境変数（ローカル開発用）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=english_study_db
DB_USER=postgres
DB_PASSWORD=postgres

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
```

#### web/client/.env.local
```bash
# 同様の設定（ポートは3001など別のポートを使用）
```


## Claude Codeへの指示（web/client - 英語学習アプリ）


英語学習アプリ（web/client）を作成してください。

### プロジェクト構成
- Next.js 15 App Router + TypeScript
- Drizzle ORM + PostgreSQL（Neon本番、Docker Composeローカル）
- TanStack Query v5
- react-hook-form
- zod
- shadcn ui
- next-auth v4（JWT戦略、Google認証のみ）
- Tailwind CSS
- Zod（バリデーション）

### ディレクトリ構成
以下の構成に従ってプロジェクトを作成してください：

```
src/
├── app/                    # App Router（薄く保つ）
│   ├── (auth)/
│   ├── (user)/
│   ├── api/
│   └── layout.tsx
├── features/               # ドメイン単位（auth, dashboard, materials, study, analytics）
├── shared/                 # 共通（components, lib, types）
└── external/               # 外部アダプタ層（dto, handler, service, repository, db, client）
```

### 設計原則
1. app/は薄く保つ
   - ページはルーティングとパラメータ受け渡しのみ
   - データフェッチや描画ロジックはfeatures/配下のTemplateに委譲
   - PageProps型を使用して型安全にパラメータを受け取る

2. features/はドメイン単位
   - 各feature配下: components/server, components/client, queries
   - clientコンポーネント: Container → Presenter → Hook の3層構造
   - Containerはロジック集約、Presenterは純粋な描画、HookはTanStack Query

3. external/は外界との接続口
   - dto: Zodスキーマでバリデーション + TypeScript型定義
   - handler: Server ActionとServer Componentの入口（featuresから呼ばれる）
   - service: ドメインサービス（ビジネスロジック）
   - repository: DBアクセス（Drizzle ORM）
   - featuresはhandlerのみをimport可能、serviceやrepositoryを直接importしない

4. Server-first × TanStack Query戦略
   - Server Componentでprefetchしてキャッシュを温める
   - HydrationBoundaryでクライアントにキャッシュを渡す
   - クライアント側は同じqueryKeyでuseQueryを使い、キャッシュを再利用
   - 静的データはTanStack Queryを使わずPromise.allで完結

### 環境変数
.env.local に以下を設定：
- DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
- NEXTAUTH_URL, NEXTAUTH_SECRET
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

環境変数は src/shared/lib/env.ts でZodバリデーション。
DB接続文字列は以下の形式で生成：
postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}

### 実装する主要機能
#### 認証
- (auth)ルートグループ: 未認証ユーザー向け（/login）
- (user)ルートグループ: 認証済みユーザー向け
- layoutでrequireAuth()を呼び、未認証は/loginへリダイレクト
- next-auth v4でJWT戦略、session.user.roleを含める

#### ダッシュボード
- 学習統計サマリー（累計解答数、正答率、今日の学習数）
- 学習カレンダー（ヒートマップ風）
- 教材一覧
- Server ComponentでprefetchしてHydrationBoundary

#### 教材 → 章 → UNIT → 問題
- 教材一覧 → 教材詳細（章一覧）→ 章詳細（UNIT一覧）→ UNIT詳細（問題リスト）
- 「順番に学習」「ランダムに学習」ボタン
- 階層構造はChapterの自己参照で実現

#### 学習画面
- 1問1答形式
- 問題カード（日本語文、ヒントボタン、進捗表示）
- 解答入力（テキスト入力、Enter送信）
- 解答判定（完全一致、複数正解対応）
- 結果表示（正解/不正解、正解リスト、音声再生ボタン、解説）
- 手動修正ボタン（不正解→正解に変更）
- 次の問題へボタン

#### 学習分析
- よくある間違い一覧
- 問題ごとの統計（正答率、解答回数）

### データベーススキーマ（Drizzle ORM）
src/external/db/schema/ 配下に以下を作成：
- accounts.ts: id, email, name, role, provider, provider_account_id
- materials.ts: id, name, description, order
- chapters.ts: id, material_id, parent_chapter_id, name, order, level（自己参照）
- units.ts: id, chapter_id, name, order
- questions.ts: id, unit_id, japanese, hint, explanation, order
- correct-answers.ts: id, question_id, answer_text, order
- user-answers.ts: id, user_id, question_id, user_answer_text, is_correct, is_manually_marked, answered_at
- question-statistics.ts: id, user_id, question_id, total_attempts, correct_count, incorrect_count, last_attempted_at
- daily-study-logs.ts: id, user_id, study_date, total_questions, correct_questions, study_time_minutes

全テーブルはUUIDをPK、created_at/updated_atを持つ。
外部キーとインデックスも適切に設定。

### ポート
localhost:3000
