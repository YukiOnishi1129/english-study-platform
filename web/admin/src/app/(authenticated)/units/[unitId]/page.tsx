import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteUnit,
  updateQuestionOrders,
} from "@/external/handler/material/material.command.server";
import { getUnitDetail } from "@/external/handler/material/material.query.server";
import { QuestionReorderTable } from "@/features/materials/components/client/QuestionReorderTable";
import { UnitDeleteButton } from "@/features/materials/components/client/UnitDeleteButton";
import { UnitQuestionCsvImporter } from "@/features/materials/components/client/UnitQuestionCsvImporter";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitDetailPath,
  toUnitEditPath,
} from "@/features/materials/lib/paths";

type ReorderResult = { success: boolean; message?: string };

type DeleteResult = { success: boolean; message?: string };

async function deleteUnitAction(data: {
  unitId: string;
  materialId: string;
  chapterId: string;
}): Promise<DeleteResult> {
  "use server";

  try {
    await deleteUnit({ unitId: data.unitId });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(data.materialId));
    revalidatePath(toChapterDetailPath(data.chapterId));

    return { success: true, message: "UNITを削除しました。" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "UNITの削除に失敗しました。",
    };
  }
}

async function reorderUnitQuestionsAction(data: {
  unitId: string;
  materialId: string;
  chapterIds: string[];
  orderedQuestionIds: string[];
}): Promise<ReorderResult> {
  "use server";

  try {
    await updateQuestionOrders({
      unitId: data.unitId,
      orderedQuestionIds: data.orderedQuestionIds,
    });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(data.materialId));

    const uniqueChapterIds = Array.from(new Set(data.chapterIds));
    for (const chapterId of uniqueChapterIds) {
      revalidatePath(toChapterDetailPath(chapterId));
    }

    revalidatePath(toUnitDetailPath(data.unitId));

    return { success: true, message: "問題の並び順を更新しました。" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "問題の並び順更新に失敗しました。",
    };
  }
}

export async function generateMetadata({
  params,
}: PageProps<"/units/[unitId]">): Promise<Metadata> {
  const { unitId } = await params;
  try {
    const detail = await getUnitDetail({ unitId });
    return {
      title: `${detail.unit.name} | ${detail.material.name} - English Study Admin`,
      description: `${detail.material.name} / ${detail.unit.name} の問題管理ページ`,
    };
  } catch {
    notFound();
  }
}

export default async function UnitDetailPage({
  params,
}: PageProps<"/units/[unitId]">) {
  const { unitId } = await params;
  const detail = await getUnitDetail({ unitId }).catch(() => null);

  if (!detail) {
    notFound();
  }

  const questionCount = detail.questions.length;
  const currentChapter = detail.chapterPath[detail.chapterPath.length - 1];

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/materials"
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              教材一覧
            </Link>
          </li>
          <li>›</li>
          <li>
            <Link
              href={toMaterialDetailPath(detail.material.id)}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {detail.material.name}
            </Link>
          </li>
          {detail.chapterPath.map((chapter) => (
            <li key={chapter.id} className="flex items-center gap-2">
              <span>›</span>
              <Link
                href={toChapterDetailPath(chapter.id)}
                className="text-indigo-600 underline-offset-2 hover:underline"
              >
                {chapter.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2">
            <span>›</span>
            <span className="font-semibold text-gray-700">
              {detail.unit.name}
            </span>
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {detail.unit.name}
          </h1>
          <p className="text-sm text-gray-600">
            {detail.material.name} の{" "}
            {detail.chapterPath.map((chapter) => chapter.name).join(" / ")}{" "}
            配下のUNITです。
          </p>
        </div>
        <Link
          href={toUnitEditPath(detail.unit.id)}
          className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          UNIT情報を編集
        </Link>
      </header>

      <section className="grid gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            問題数
          </dt>
          <dd className="mt-2 text-3xl font-bold text-gray-900">
            {questionCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            並び順
          </dt>
          <dd className="mt-2 text-xl font-semibold text-gray-800">
            {detail.unit.order}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            作成日
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            {new Date(detail.unit.createdAt).toLocaleString("ja-JP")}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            最終更新
          </dt>
          <dd className="mt-2 text-sm text-gray-700">
            {new Date(detail.unit.updatedAt).toLocaleString("ja-JP")}
          </dd>
        </div>
      </section>

      <section className="space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">問題の管理</h2>
            <p className="text-sm text-gray-600">
              1問ずつ編集するか、CSVを使ってまとめて更新できます。CSV取込は下記から行ってください。
            </p>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500"
          >
            手動で問題を追加（WIP）
          </button>
        </header>

        <UnitQuestionCsvImporter
          materialId={detail.material.id}
          chapterId={currentChapter?.id ?? detail.unit.chapterId}
          unitId={detail.unit.id}
          unitName={detail.unit.name}
          existingQuestionCount={questionCount}
        />
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            登録済みの問題一覧
          </h2>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {questionCount} 件
          </span>
        </header>

        {detail.questions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
            登録済みの問題はありません。CSVインポートまたは手動登録（準備中）で追加してください。
          </div>
        ) : (
          <QuestionReorderTable
            questions={detail.questions.map((question) => ({
              id: question.id,
              japanese: question.japanese,
              updatedAt: question.updatedAt,
              order: question.order,
            }))}
            serverActionArgs={{
              unitId: detail.unit.id,
              materialId: detail.material.id,
              chapterIds: detail.chapterPath.map((chapter) => chapter.id),
            }}
            reorderUnitQuestionsAction={reorderUnitQuestionsAction}
          />
        )}
        <UnitDeleteButton
          unitId={detail.unit.id}
          unitName={detail.unit.name}
          chapterId={detail.unit.chapterId}
          materialId={detail.material.id}
          deleteUnitAction={deleteUnitAction}
        />
      </section>
    </main>
  );
}
