# ドメインモデル詳細設計

---

### 1. エンティティ（Entity）

同一性（ID）を持ち、ライフサイクル全体で追跡される必要があるオブジェクト。

### 【ユーザー・認証ドメイン】

- **Account**: ユーザーアカウント情報
  - id: string (UUID)
  - email: string (一意制約)
  - firstName: string
  - lastName: string
  - role: Role ("admin" | "user")
  - provider: string (例: "google")
  - providerAccountId: string (OAuth プロバイダー側のID)
  - createdAt: Date
  - updatedAt: Date

### 【教材ドメイン】

- **Material**: 教材
  - id: string (UUID)
  - name: string
  - description: string
  - order: number
  - createdAt: Date
  - updatedAt: Date

- **Chapter**: 章（階層ノード）
  - id: string (UUID)
  - materialId: string (FK)
  - parentChapterId: string | null (FK, 自己参照)
  - name: string
  - order: number
  - level: number (階層の深さ 0から)
  - createdAt: Date
  - updatedAt: Date

- **Unit**: ユニット
  - id: string (UUID)
  - chapterId: string (FK)
  - name: string
  - order: number
  - createdAt: Date
  - updatedAt: Date

- **Question**: 問題
  - id: string (UUID)
  - unitId: string (FK)
  - japanese: string (問題文)
  - prompt: string | null (追加指示や語彙ヒント)
  - hint: string | null
  - explanation: string | null
  - questionType: QuestionType (デフォルトは"phrase"。語彙セッションではランタイムで学習モードを切り替え)
  - vocabularyEntryId: string | null (語彙教材の場合)
  - order: number
  - createdAt: Date
  - updatedAt: Date

- **CorrectAnswer**: 正解
  - id: string (UUID)
  - questionId: string (FK)
  - answerText: string
  - order: number
  - createdAt: Date
  - updatedAt: Date

### 【語彙ドメイン】

- **VocabularyEntry**: 語彙エントリ
  - id: string (UUID)
  - materialId: string (FK)
  - headword: string (英単語)
  - pronunciation: string | null
  - partOfSpeech: string | null
  - definitionJa: string
  - memo: string | null
  - exampleSentenceEn: string | null
  - exampleSentenceJa: string | null
  - createdAt: Date
  - updatedAt: Date

- **VocabularyRelation**: 語彙関連語
  - id: string (UUID)
  - vocabularyEntryId: string (FK)
  - relationType: VocabularyRelationType
  - relatedText: string
  - note: string | null
  - createdAt: Date
  - updatedAt: Date

### 【学習記録ドメイン】

- **UserAnswer**: ユーザーの個別解答記録
  - id: string (UUID)
  - userId: string (FK)
  - questionId: string (FK)
  - userAnswerText: string
  - isCorrect: boolean
  - isManuallyMarked: boolean (デフォルト: false)
  - answeredAt: Date
  - createdAt: Date
  - updatedAt: Date

- **QuestionStatistics**: 問題ごとの統計情報
  - id: string (UUID)
  - userId: string (FK)
  - questionId: string (FK)
  - totalAttempts: number (デフォルト: 0)
  - correctCount: number (デフォルト: 0)
  - incorrectCount: number (デフォルト: 0)
  - lastAttemptedAt: Date | null
  - createdAt: Date
  - updatedAt: Date

- **DailyStudyLog**: 日次学習ログ
  - id: string (UUID)
  - userId: string (FK)
  - studyDate: Date (日付部分のみ)
  - totalQuestions: number (デフォルト: 0)
  - correctQuestions: number (デフォルト: 0)
  - studyTimeMinutes: number (デフォルト: 0)
  - createdAt: Date
  - updatedAt: Date

---

### 2. 値オブジェクト（Value Object）

同一性を持たず、属性の値で比較されるオブジェクト。不変。

### Role（ロール）

- 値: `admin` | `user`
- ビジネスルール: 管理画面アクセス権限の判定
- メソッド例:
    - `isAdmin()`: 管理者かどうか
    - `canAccessAdminPanel()`: 管理画面にアクセス可能か

### AnswerResult（解答結果）

- 値: `correct` | `incorrect` | `manually_corrected`
- ビジネスルール: 正答率計算時の扱い
- メソッド例:
    - `isCorrect()`: 正解として扱うか（manually_correctedも含む）
    - `wasManuallyMarked()`: 手動マークかどうか

### ChapterPath（章パス）

- 値: 階層構造を表す文字列（例: "第1章/定型フレーズ編/基本挨拶"）
- ビジネスルール: 階層の深さ、親子関係の検証
- メソッド例:
    - `getLevel()`: 階層の深さを取得
    - `getParentPath()`: 親の章パスを取得
    - `toArray()`: 配列形式で各階層を取得

### QuestionType（出題タイプ）

- 値: `phrase` | `jp_to_en` | `en_to_jp` | `cloze` | `free_sentence`
- ビジネスルール:
    - UI層での判定ロジック・表示切替の基準（語彙セッションではランタイム選択）
    - 語彙CSVではモード列を持たず、VocabularyEntryに紐づくQuestionは共通データを提供
- メソッド例:
    - `requiresVocabularyEntry()`: 語彙エントリの紐付けが必須かどうか
    - `isFreeForm()`: 自由記述採点が必要かどうか

### VocabularyRelationType（語彙関連タイプ）

- 値: `synonym` | `antonym` | `related`
- ビジネスルール: 表示順や分類ラベルの制御
- メソッド例:
    - `getLabel()`: UI表示用のラベルを返却

### AccuracyRate（正答率）

- **値**: 0.0〜1.0 または 0〜100%
- **ビジネスルール**: 正答率の計算・表示形式
- **メソッド例**:
  - `calculate(correctCount, totalCount)`: 正答率を計算
  - `toPercentage()`: パーセント表記に変換
  - `isHigh()`: 高正答率かどうか（例: 80%以上）

### StudyDate（学習日）

- 値: 日付（YYYY-MM-DD）
- ビジネスルール: 日次集計のキー、連続学習日数の計算
- メソッド例:
    - `isToday()`: 今日かどうか
    - `isSameWeek()`: 同じ週かどうか
    - `daysBetween(other)`: 日数差を計算

---

### 3. 集約（Aggregate）

整合性境界を持つエンティティと値オブジェクトのまとまり。集約ルート経由でのみ外部からアクセス。

### Account集約

- **集約ルート**: Account
- **含まれるもの**: Account単体
- **整合性ルール**:
    - roleは必ずadminかuserのいずれか
    - emailは一意
    - providerとproviderAccountIdの組み合わせは一意

### Material集約

- **集約ルート**: Material
- **含まれるもの**: Material → Chapter（階層） → Unit → Question → CorrectAnswer (+ VocabularyEntry → VocabularyRelation)
- **整合性ルール**:
    - Chapterの親子関係が循環しない
    - Chapterのlevelとparentの関係が整合している
    - 同一親配下のorder値は重複しない
    - Questionには最低1つのCorrectAnswerが必要
    - CorrectAnswerのorderは1から連番
    - questionTypeが語彙系の場合、vocabularyEntryIdが必須
    - Material内のVocabularyEntry.headwordは重複させない

### StudyRecord集約

- **集約ルート**: QuestionStatistics
- **含まれるもの**: QuestionStatistics + UserAnswer（参照）
- **整合性ルール**:
    - totalAttempts = correctCount + incorrectCount
    - 統計値とUserAnswerの実データが整合している
    - DailyStudyLogの合計値が実際の解答数と一致

---

### 4. ドメインロジック

各エンティティ・値オブジェクトが持つビジネスルール。

### Account

- **権限チェック**
    - 管理画面アクセス可否の判定
    - ロールベースの機能制限

### Material集約

- **階層構造の構築**
    - ChapterPathから親子関係を解決
    - ツリー構造の検証（循環参照チェック）
- **順序制御**
    - 同一階層内での表示順管理
    - 順序の入れ替え
- **完全性チェック**
    - 問題に正解が存在するか
    - 必須項目の検証
- **語彙エントリ管理**
    - VocabularyEntryの重複チェック
    - 関連語（VocabularyRelation）の整合性維持（削除時に付随データも削除）

### Question

- **解答判定**
    - ユーザー回答と正解の照合（完全一致）
    - 複数正解のいずれかにマッチするか
    - 大文字小文字の正規化
    - questionTypeごとのロジック切り替え（語彙挿入、自由作文、選択式など）※語彙教材では学習セッションがモードを指定
- **手動修正**
    - 不正解から正解への変更
    - 統計への反映
- **語彙表示**
    - VocabularyEntryが紐づく場合、品詞・類義語・対義語を提示
    - 学習モードに応じたプロンプト生成と説明文を提供

### QuestionStatistics

- **統計の更新**
    - 解答結果に基づく集計値の更新
    - 正答率の再計算
    - 最終解答日時の更新
- **正答率計算**
    - correctCount / totalAttempts
    - manually_correctedも正解としてカウント

### DailyStudyLog

- **日次集計**
    - その日の解答数の集計
    - 正解数の集計
    - 学習時間の記録
- **連続学習日数の計算**
    - 前日のログとの比較
    - ストリーク（連続記録）の判定

---

### 5. ドメインサービス

複数の集約にまたがるロジックや、特定のエンティティに属さないビジネスロジック。

### CSVImportService（CSV取り込みサービス）

- **責務**:
    - CSVファイルの解析
    - ChapterPathからChapter階層構造の構築
    - Material、Chapter、Unit、Question、CorrectAnswerへの分解と登録
    - トランザクション管理
- **処理フロー**:
    1. CSVをパース
    2. 教材の存在確認または作成
    3. 章パスを解析して階層構造を構築
    4. 各行からUnit、Question、CorrectAnswerを生成
    5. 整合性チェック
    6. 一括DB登録

### AnswerJudgementService（解答判定サービス）

- **責務**:
    - ユーザー回答の正誤判定
    - 統計情報の更新
    - 日次ログの更新
- **処理フロー**:
    1. ユーザー回答を正規化
    2. 正解リストと照合
    3. UserAnswerレコード作成
    4. QuestionStatisticsを更新
    5. DailyStudyLogを更新

### StudyAnalyticsService（学習分析サービス）

- **責務**:
    - よくある間違いの分析
    - 弱点問題の抽出
    - 学習傾向の分析
- **提供機能**:
    - 問題ごとの間違いパターン抽出
    - 正答率が低い問題のリストアップ
    - 学習時間帯の分析
    - 連続学習日数の計算

### QuestionRandomizerService（問題ランダム化サービス）

- **責務**:
    - 指定されたUnit内の問題をランダム順に並べ替え
- **処理フロー**:
    1. Unitに紐づく問題リストを取得
    2. シャッフルアルゴリズムで並べ替え
    3. 出題順序を返却

### StatisticsAggregationService（統計集計サービス）

- **責務**:
    - 複数の学習記録を集計
    - ダッシュボード用のサマリーデータ作成
- **提供機能**:
    - 累計解答数、正答率
    - 今日/今週/今月の学習量
    - 学習カレンダーデータの生成
    - 教材別・単元別の進捗状況

### ChapterTreeBuilder（章ツリー構築サービス）

- **責務**:
    - ChapterPathから階層構造を構築
    - 親子関係の解決
- **処理フロー**:
    1. パスを解析（"第1章/定型フレーズ編/基本挨拶"）
    2. 各階層のChapterを作成または取得
    3. parentChapterIdとlevelを設定
    4. ツリー構造を返却

### VocabularyImportService（語彙インポートサービス）

- **責務**:
    - 語彙CSVの解析とVocabularyEntry生成
    - VocabularyRelation/Question/CorrectAnswerの一括登録（Questionは語彙1件につき1レコードを生成し、学習時にモード切替）
    - 既存語彙の更新とユニーク性の担保
- **処理フロー**:
    1. CSVをパースし語彙情報と正解候補を抽出
    2. headword単位でVocabularyEntryを作成または更新
    3. 類義語・対義語をVocabularyRelationとして登録
    4. Questionを単語ごとに1件生成し、正解候補をCorrectAnswerとして登録
    5. トランザクションでMaterial配下に保存

---

### 6. リポジトリインターフェース

集約の永続化と再構築を担当（実装はインフラ層）。

### AccountRepository

- `findById(id)`: IDでアカウント取得
- `findByEmail(email)`: メールアドレスでアカウント取得
- `findByProvider(provider, providerAccountId)`: プロバイダー情報で取得
- `save(account)`: アカウント保存
- `delete(id)`: アカウント削除

### MaterialRepository

- `findById(id)`: 教材取得（Chapter階層含む）
- `findAll()`: 全教材取得
- `save(material)`: 教材保存
- `delete(id)`: 教材削除

### ChapterRepository

- `findByMaterialId(materialId)`: 教材配下の全章取得
- `findByParentId(parentId)`: 子章を取得
- `findByPath(path)`: 章パスで検索
- `save(chapter)`: 章保存
- `saveTree(chapters)`: 章階層を一括保存
- `delete(id)`: 章削除

### UnitRepository

- `findByChapterId(chapterId)`: 章配下の全UNIT取得
- `findById(id)`: UNIT取得
- `save(unit)`: UNIT保存
- `delete(id)`: UNIT削除

### QuestionRepository

- `findByUnitId(unitId)`: UNIT配下の全問題取得
- `findById(id)`: 問題取得（正解リスト含む）
- `save(question)`: 問題保存
- `delete(id)`: 問題削除
- `findByVocabularyEntryId(entryId)`: 語彙エントリに紐づく問題取得

### VocabularyEntryRepository

- `findById(id)`: 語彙エントリ取得
- `findByHeadword(materialId, headword)`: 教材内の語彙検索
- `findByMaterialId(materialId)`: 教材配下の語彙一覧取得
- `save(entry)`: 語彙エントリ保存
- `delete(id)`: 語彙エントリ削除

### VocabularyRelationRepository

- `findByEntryId(entryId)`: 関連語一覧取得
- `saveMany(relations)`: 関連語一括保存
- `deleteByEntryId(entryId)`: 関連語一括削除

### UserAnswerRepository

- `findByUserId(userId)`: ユーザーの全解答履歴
- `findByQuestionId(questionId, userId)`: 特定問題の解答履歴
- `save(answer)`: 解答保存

### QuestionStatisticsRepository

- `findByUserAndQuestion(userId, questionId)`: 問題統計取得
- `findByUserId(userId)`: ユーザーの全統計
- `save(statistics)`: 統計保存
- `updateCounts(userId, questionId, isCorrect)`: カウント更新

### DailyStudyLogRepository

- `findByUserAndDate(userId, date)`: 特定日のログ取得
- `findByUserAndDateRange(userId, startDate, endDate)`: 期間のログ取得
- `save(log)`: ログ保存

---

### 7. ドメインイベント

ドメイン内で発生する重要な出来事。他の集約への影響を疎結合に伝播。

### AnswerSubmitted（解答提出イベント）

- **発行タイミング**: ユーザーが解答を送信した時
- **データ**: userId, questionId, userAnswerText, isCorrect, answeredAt
- **購読者**:
    - QuestionStatisticsの更新
    - DailyStudyLogの更新

### AnswerMarkedAsCorrect（手動で正解マーク）

- **発行タイミング**: 不正解を手動で正解にした時
- **データ**: userAnswerId, userId, questionId
- **購読者**:
    - QuestionStatisticsの再計算
    - DailyStudyLogの修正

### MaterialImported（教材インポート完了）

- **発行タイミング**: CSVから教材が取り込まれた時
- **データ**: materialId, chapterCount, unitCount, questionCount
- **購読者**:
    - 管理画面への通知
    - キャッシュのクリア

### StudySessionCompleted（学習セッション完了）

- **発行タイミング**: UNITの全問題を解き終わった時
- **データ**: userId, unitId, totalQuestions, correctCount, duration
- **購読者**:
    - DailyStudyLogの集計
    - バッジ・達成度の更新（将来拡張）
