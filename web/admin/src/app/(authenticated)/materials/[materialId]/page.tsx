import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import type {
  MaterialChapterSummaryDto,
  MaterialHierarchyItemDto,
} from "@/external/dto/material/material.query.dto";
import {
  createChapter,
  createUnit,
} from "@/external/handler/material/material.command.server";
import { getMaterialHierarchyById } from "@/external/handler/material/material.query.server";
import { ChapterCreateForm } from "@/features/materials/components/client/ChapterCreateForm";
import { UnitCreateForm } from "@/features/materials/components/client/UnitCreateForm";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export const dynamic = "force-dynamic";

function countUnits(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) =>
      total + chapter.units.length + countUnits(chapter.children),
    0,
  );
}

function countChapters(chapters: MaterialChapterSummaryDto[]): number {
  return chapters.reduce(
    (total, chapter) => total + 1 + countChapters(chapter.children),
    0,
  );
}

async function handleCreateChapter(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const materialId = formData.get("materialId");
  const parentChapterId = formData.get("parentChapterId");
  const name = formData.get("name");
  const description = formData.get("description");

  const materialIdValue = typeof materialId === "string" ? materialId : "";

  try {
    await createChapter({
      materialId: materialIdValue,
      parentChapterId:
        typeof parentChapterId === "string" && parentChapterId.length > 0
          ? parentChapterId
          : undefined,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    revalidatePath("/materials");
    if (materialIdValue) {
      revalidatePath(`/materials/${materialIdValue}`);
    }

    return { status: "success" };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "章の作成に失敗しました。",
    };
  }
}

async function handleCreateUnit(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const chapterIdEntry = formData.get("chapterId");
  const materialIdEntry = formData.get("materialId");
  const name = formData.get("name");
  const description = formData.get("description");

  const chapterId = typeof chapterIdEntry === "string" ? chapterIdEntry : "";
  const materialId = typeof materialIdEntry === "string" ? materialIdEntry : "";

  try {
    const unit = await createUnit({
      chapterId,
      name: typeof name === "string" ? name : "",
      description: typeof description === "string" ? description : undefined,
    });

    if (materialId.length > 0 && chapterId.length > 0) {
      revalidatePath(
        `/materials/${materialId}/chapters/${chapterId}/units/${unit.id}`,
      );
    }
    revalidatePath("/materials");
    if (materialId.length > 0) {
      revalidatePath(`/materials/${materialId}`);
    }

    return {
      status: "success",
      redirect:
        materialId.length > 0 && chapterId.length > 0
          ? toUnitDetailPath(materialId, chapterId, unit.id)
          : undefined,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = error.issues ?? [];
      return {
        status: "error",
        message: issues[0]?.message ?? "入力内容を確認してください。",
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "UNITの作成に失敗しました。",
    };
  }
}

function renderChapter(
  chapter: MaterialChapterSummaryDto,
  material: MaterialHierarchyItemDto,
  depth = 0,
) {
  const indentClass = depth > 0 ? "pl-4 border-l border-gray-200" : "";
  const childChapters = [...chapter.children].sort((a, b) => a.order - b.order);

  return (
    <div key={chapter.id} className={`space-y-3 ${indentClass}`.trim()}>
      <article className="rounded-md border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <header className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              {chapter.level > 0 ? (
                <span className="mr-2 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
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
            <p className="text-xs text-gray-600">{chapter.description}</p>
          ) : null}
        </header>

        <div className="mt-3 space-y-2">
          {chapter.units.length === 0 ? (
            <p className="rounded border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-500">
              UNITが登録されていません。
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {chapter.units
                .sort((a, b) => a.order - b.order)
                .map((unit) => (
                  <li key={unit.id}>
                    <Link
                      href={`/materials/${material.id}/chapters/${chapter.id}/units/${unit.id}`}
                      className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                    >
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                        UNIT
                      </span>
                      {unit.name}
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>

        <details className="mt-4 rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <summary className="cursor-pointer text-xs font-semibold text-gray-700">
            章やUNITを追加する
          </summary>
          <div className="mt-3 space-y-3">
            <UnitCreateForm
              action={handleCreateUnit}
              chapterId={chapter.id}
              materialId={material.id}
              chapterName={chapter.name}
            />
            <ChapterCreateForm
              action={handleCreateChapter}
              materialId={material.id}
              parentChapterId={chapter.id}
              parentChapterName={chapter.name}
            />
          </div>
        </details>
      </article>

      {childChapters.map((child) => renderChapter(child, material, depth + 1))}
    </div>
  );
}

interface MaterialDetailPageProps {
  params: {
    materialId: string;
  };
}

export default async function MaterialDetailPage(
  props: MaterialDetailPageProps,
) {
  const material = await getMaterialHierarchyById({
    materialId: props.params.materialId,
  });

  if (!material) {
    notFound();
  }

  const totalUnits = countUnits(material.chapters);
  const totalChapters = countChapters(material.chapters);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href="/materials"
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 教材一覧に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{material.name}</h1>
        <p className="text-sm text-gray-600">
          {material.description ?? "説明は登録されていません。"}
        </p>
      </header>

      <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            章の数（全階層）
          </dt>
          <dd className="mt-2 text-2xl font-bold text-gray-900">
            {totalChapters}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            UNITの数
          </dt>
          <dd className="mt-2 text-2xl font-bold text-gray-900">
            {totalUnits}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            更新日時
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            {new Date(material.updatedAt).toLocaleString("ja-JP")}
          </dd>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">章の構成</h2>
          <details className="rounded-md border border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <summary className="cursor-pointer text-sm font-semibold text-indigo-800">
              ルート直下に章を追加する
            </summary>
            <div className="mt-3">
              <ChapterCreateForm
                action={handleCreateChapter}
                materialId={material.id}
              />
            </div>
          </details>
        </header>

        {material.chapters.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-600">
            章が登録されていません。上のフォームから章を追加しましょう。
          </p>
        ) : (
          <div className="space-y-5">
            {material.chapters.map((chapter) =>
              renderChapter(chapter, material),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
