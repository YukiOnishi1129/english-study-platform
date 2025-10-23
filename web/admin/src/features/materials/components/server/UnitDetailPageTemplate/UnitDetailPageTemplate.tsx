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

export const dynamic = "force-dynamic";

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

interface UnitDetailPageTemplateProps {
  unitId: string;
}

export async function UnitDetailPageTemplate(
  props: UnitDetailPageTemplateProps,
) {
  const detail = await getUnitDetail({ unitId: props.unitId }).catch(
    () => null,
  );

  if (!detail) {
    notFound();
  }

  const questionCount = detail.questions.length;

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

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">問題の並び順</h2>
          <UnitQuestionCsvImporter
            unitId={detail.unit.id}
            materialId={detail.material.id}
            chapterPath={detail.chapterPath}
          />
        </header>
        <QuestionReorderTable
          unitId={detail.unit.id}
          materialId={detail.material.id}
          chapterIds={detail.chapterPath.map((chapter) => chapter.id)}
          questions={detail.questions}
          onReorder={reorderUnitQuestionsAction}
        />
      </section>

      <section>
        <UnitDeleteButton
          unitId={detail.unit.id}
          unitName={detail.unit.name}
          materialId={detail.material.id}
          chapterId={
            detail.chapterPath[detail.chapterPath.length - 1]?.id ?? ""
          }
          deleteUnitAction={deleteUnitAction}
        />
      </section>
    </main>
  );
}
