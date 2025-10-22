import Link from "next/link";
import { getMaterialsHierarchy } from "@/external/handler/material/material.query.server";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await getMaterialsHierarchy();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">教材管理</h1>
        <p className="text-sm text-gray-600">
          教材・章・UNITを確認し、UNIT詳細から問題を管理します。問題のCSVインポートは各UNITのページで行えます。
        </p>
      </header>

      {materials.length === 0 ? (
        <section className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
          <p>
            登録済みの教材がありません。先に教材・章・UNITを作成してください。
          </p>
        </section>
      ) : (
        <div className="space-y-8">
          {materials.map((material) => (
            <section
              key={material.id}
              className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <header className="flex flex-col gap-1 border-b border-gray-100 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {material.name}
                  </h2>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {material.chapters.length}章 /{" "}
                    {material.chapters.reduce(
                      (unitCount, chapter) => unitCount + chapter.units.length,
                      0,
                    )}
                    UNIT
                  </span>
                </div>
                {material.description ? (
                  <p className="text-sm text-gray-600">
                    {material.description}
                  </p>
                ) : null}
              </header>

              <div className="space-y-3">
                {material.chapters.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    章が登録されていません。
                  </p>
                ) : (
                  material.chapters
                    .sort((a, b) => a.order - b.order)
                    .map((chapter) => (
                      <article
                        key={chapter.id}
                        className="rounded-md border border-gray-100 bg-gray-50 px-4 py-3"
                      >
                        <header className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-800">
                              {chapter.level > 0 ? (
                                <span className="mr-2 text-xs font-medium text-indigo-500">
                                  Lv.{chapter.level}
                                </span>
                              ) : null}
                              {chapter.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chapter.units.length} UNIT
                            </span>
                          </div>
                          {chapter.description ? (
                            <p className="text-xs text-gray-600">
                              {chapter.description}
                            </p>
                          ) : null}
                        </header>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {chapter.units.length === 0 ? (
                            <span className="rounded-md border border-dashed border-gray-300 px-3 py-1 text-xs text-gray-500">
                              UNIT未登録
                            </span>
                          ) : (
                            chapter.units
                              .sort((a, b) => a.order - b.order)
                              .map((unit) => (
                                <Link
                                  key={unit.id}
                                  href={`/materials/${chapter.materialId}/chapters/${chapter.id}/units/${unit.id}`}
                                  className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                                >
                                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                                    UNIT
                                  </span>
                                  {unit.name}
                                </Link>
                              ))
                          )}
                        </div>
                      </article>
                    ))
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
