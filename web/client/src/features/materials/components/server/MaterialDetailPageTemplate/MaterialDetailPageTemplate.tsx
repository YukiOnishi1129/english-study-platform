import Link from "next/link";

import { findPlaceholderMaterial } from "@/features/materials/data/placeholder-materials";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/components/ui/breadcrumb";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

interface MaterialDetailPageTemplateProps {
  materialId: string;
}

export function MaterialDetailPageTemplate(
  props: MaterialDetailPageTemplateProps,
) {
  const { materialId } = props;
  const material = findPlaceholderMaterial(materialId);

  const materialName = material?.name ?? "教材プレビュー";
  const materialDescription =
    material?.description ??
    "この教材の詳細データはまだ接続されていません。管理画面から登録した内容がここに表示される予定です。";

  const chapters = material?.chapters ?? [];
  const unitCount = material?.unitCount ?? 0;
  const totalQuestions = material?.totalQuestions ?? 0;
  const masteryRate = material ? Math.round(material.masteryRate * 100) : null;

  const breadcrumbRoot: "/materials" = "/materials";

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={breadcrumbRoot}>教材一覧</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{materialName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {materialName}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {materialDescription}
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 text-sm text-muted-foreground md:w-auto md:text-right">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 md:justify-end md:gap-3">
              <span>UNIT数</span>
              <span className="font-semibold text-slate-900">
                {unitCount} UNIT
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 md:justify-end md:gap-3">
              <span>問題数</span>
              <span className="font-semibold text-slate-900">
                {totalQuestions} 問
              </span>
            </div>
            {masteryRate !== null ? (
              <div className="flex items-center justify-between rounded-lg bg-indigo-50/70 px-3 py-1.5 md:justify-end md:gap-3">
                <span className="font-medium text-indigo-700">達成率</span>
                <span className="font-semibold text-indigo-700">
                  {masteryRate}%
                </span>
              </div>
            ) : null}
          </div>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">章の構成</h2>
          <p className="text-sm text-muted-foreground">
            管理画面で設定した章と紐づくUNITの数を確認できます。各章を開くとUNIT詳細と学習ページにアクセスできます。
          </p>
        </div>

        {chapters.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {chapters.map((chapter) => {
              const sampleUnitHref: `/units/${string}` = chapter.sampleUnitId
                ? `/units/${chapter.sampleUnitId}`
                : `/units/${materialId.slice(0, 8)}-preview-unit`;
              return (
                <Card key={chapter.id} className="border border-indigo-100/80">
                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg text-slate-900">
                      {chapter.name}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {chapter.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <dl className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <dt className="text-muted-foreground">UNIT数</dt>
                        <dd className="font-semibold text-slate-900">
                          {chapter.unitCount}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <dt className="text-muted-foreground">学習テーマ</dt>
                        <dd className="font-semibold text-slate-900">
                          {chapter.focus}
                        </dd>
                      </div>
                    </dl>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={sampleUnitHref}>
                        {chapter.sampleUnitId
                          ? "UNIT詳細ページを開く"
                          : "サンプルUNITプレビュー"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-indigo-200 bg-indigo-50/60">
            <CardHeader>
              <CardTitle className="text-base text-indigo-900">
                章データは未連携です
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-indigo-800/90">
                本番環境ではCSVインポートや個別登録で作成した章・UNITがここに表示されます。現在はUIのラフを確認できる状態です。
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <Separator />

      <Card className="border border-slate-200/80 bg-white/90">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            次のステップ（TODO）
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            - external層に教材詳細のハンドラ・サービスを追加してDBと接続する。
            <br />- TanStack
            Queryのプリフェッチを組み込み、UNIT一覧・学習ページへの導線を最適化する。
            <br />-
            章ツリー表示や進捗メトリクスの可視化コンポーネントを追加する。
          </CardDescription>
        </CardHeader>
      </Card>

      {material === null ? (
        <Card className="border-red-200 bg-red-50/80 text-red-700">
          <CardHeader>
            <CardTitle>プレースホルダーを表示しています</CardTitle>
            <CardDescription className="text-sm text-red-700/80">
              指定された教材IDのサンプルデータが用意されていないため、汎用的な説明を表示しています。
              実データと接続する際にはmaterialsテーブルの内容をもとに描画されます。
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}
