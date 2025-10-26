import Link from "next/link";
import { notFound } from "next/navigation";

import { getMaterialDetail } from "@/external/handler/material/material.query.server";
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

export async function MaterialDetailPageTemplate({
  materialId,
}: MaterialDetailPageTemplateProps) {
  const detail = await getMaterialDetail({ materialId }).catch(() => null);
  if (!detail) {
    notFound();
  }

  const { material, chapters } = detail;
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
            <BreadcrumbPage>{material.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {material.name}
            </CardTitle>
            {material.description ? (
              <CardDescription className="text-sm leading-relaxed">
                {material.description}
              </CardDescription>
            ) : (
              <CardDescription className="text-sm text-muted-foreground">
                説明が登録されていません。
              </CardDescription>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 text-sm text-muted-foreground md:w-auto md:text-right">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 md:justify-end md:gap-3">
              <span>UNIT数</span>
              <span className="font-semibold text-slate-900">
                {material.totalUnits} UNIT
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 md:justify-end md:gap-3">
              <span>問題数</span>
              <span className="font-semibold text-slate-900">
                {material.totalQuestions} 問
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground md:justify-end md:gap-3">
              <span>最終更新日</span>
              <time dateTime={material.updatedAt}>
                {new Date(material.updatedAt).toLocaleDateString()}
              </time>
            </div>
          </div>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">章の構成</h2>
          <p className="text-sm text-muted-foreground">
            各章ごとのUNIT数と問題数を確認できます。章を開いて学習を開始しましょう。
          </p>
        </div>

        {chapters.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {chapters.map((chapter) => (
              <Card key={chapter.id} className="border border-indigo-100/80">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg text-slate-900">
                    {chapter.name}
                  </CardTitle>
                  {chapter.description ? (
                    <CardDescription className="text-sm leading-relaxed">
                      {chapter.description}
                    </CardDescription>
                  ) : null}
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
                      <dt className="text-muted-foreground">問題数</dt>
                      <dd className="font-semibold text-slate-900">
                        {chapter.questionCount}
                      </dd>
                    </div>
                  </dl>
                  <Button variant="outline" className="w-full" disabled>
                    章の詳細（準備中）
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-indigo-200 bg-indigo-50/60">
            <CardHeader>
              <CardTitle className="text-base text-indigo-900">
                この教材に章は登録されていません
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed text-indigo-800/90">
                管理画面から章を作成すると、ここに一覧が表示されます。
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>

      <Separator />

      <Card className="border border-slate-200/80 bg-white/90">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">
            次のステップ
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            - 各章の詳細ページや学習導線を実装する
            <br />- 学習状況に応じた指標や進捗バッジを追加する
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
