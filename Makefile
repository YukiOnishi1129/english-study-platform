# Load environment variables
include .env
export

# Enter database container
.PHONY: db
db:
	docker exec -it $(DB_CONTAINER_NAME) bash

# psql -U user -d ENGLISH_STUDY_PLATFORM_DB

# - \l - データベース一覧
# - \dt - テーブル一覧（今は空です）
# - \d テーブル名 - テーブルの詳細
# - \q - psqlを終了
# - \h - ヘルプ
# - SELECT * FROM テーブル名; - データ取得