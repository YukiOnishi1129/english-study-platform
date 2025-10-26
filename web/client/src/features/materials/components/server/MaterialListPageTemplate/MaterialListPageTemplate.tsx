import Link from "next/link";

import { placeholderMaterials } from "@/features/materials/data/placeholder-materials";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

function formatMastery(rate: number) {
  return `${Math.round(rate * 100)}%`;
}

export function MaterialListPageTemplate() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-slate-900">教材一覧</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          管理画面で作成した教材のプレビューです。ここでは教材ごとの進捗やUnit数を確認でき、
          学習導線のテストに活用できます。実データ連携は今後実装予定です。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {placeholderMaterials.map((material) => {
          const detailHref: `/materials/${string}` = `/materials/${material.id}`;
          return (
            <Card
              key={material.id}
              className="border-indigo-100/80 bg-white/95 shadow-sm"
            >
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl text-slate-900">
                  {material.name}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {material.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <dl className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-muted-foreground">UNIT数</dt>
                    <dd className="font-semibold text-slate-900">
                      {material.unitCount} UNIT
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <dt className="text-muted-foreground">問題数</dt>
                    <dd className="font-semibold text-slate-900">
                      {material.totalQuestions} 問
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-indigo-50/70 px-3 py-2">
                    <dt className="text-indigo-700 font-medium">達成率</dt>
                    <dd className="text-indigo-700 font-semibold">
                      {formatMastery(material.masteryRate)}
                    </dd>
                  </div>
                </dl>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>最終更新日</span>
                  <time dateTime={material.updatedAt}>
                    {material.updatedAt}
                  </time>
                </div>
                <Button asChild className="w-full">
                  <Link href={detailHref}>教材の詳細を見る</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-dashed border-indigo-200 bg-indigo-50/60">
        <CardHeader>
          <CardTitle className="text-base text-indigo-900">
            今後の実装予定
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-indigo-800/90">
            管理画面で登録した教材データをサーバー側で取得し、TanStack
            Queryと組み合わせて動的に表示します。
            また、教材の検索やフィルタリング機能、学習状況に応じた優先度表示などを追加予定です。
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
