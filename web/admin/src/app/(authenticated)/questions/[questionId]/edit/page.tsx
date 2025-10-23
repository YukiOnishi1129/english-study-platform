import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZodError } from "zod";
import { updateQuestion } from "@/external/handler/material/material.command.server";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import { QuestionEditForm } from "@/features/materials/components/client/QuestionEditForm";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import type { FormState } from "@/features/materials/types/formState";

export const dynamic = "force-dynamic";

async function handleUpdateQuestion(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  "use server";

  const questionIdEntry = formData.get("questionId");
  const unitIdEntry = formData.get("unitId");
  const japaneseEntry = formData.get("japanese");
  const hintEntry = formData.get("hint");
  const explanationEntry = formData.get("explanation");
  const orderEntry = formData.get("order");
  const correctAnswersEntries = formData.getAll("correctAnswers");

  const questionId = typeof questionIdEntry === "string" ? questionIdEntry : "";
  const unitId = typeof unitIdEntry === "string" ? unitIdEntry : "";

  const correctAnswers = correctAnswersEntries
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);

  const orderNumber =
    typeof orderEntry === "string" && orderEntry.trim().length > 0
      ? Number(orderEntry)
      : undefined;

  try {
    if (!questionId || !unitId) {
      throw new Error("必要なIDが取得できませんでした。");
    }

    if (correctAnswers.length === 0) {
      throw new Error("英語正解を1件以上入力してください。");
    }

    const detail = await updateQuestion({
      questionId,
      unitId,
      japanese: typeof japaneseEntry === "string" ? japaneseEntry : "",
      hint:
        typeof hintEntry === "string" && hintEntry.length > 0
          ? hintEntry
          : undefined,
      explanation:
        typeof explanationEntry === "string" && explanationEntry.length > 0
          ? explanationEntry
          : undefined,
      order:
        typeof orderNumber === "number" && Number.isFinite(orderNumber)
          ? orderNumber
          : undefined,
      correctAnswers,
    });

    revalidatePath("/materials");
    revalidatePath(toMaterialDetailPath(detail.material.id));
    if (detail.chapterPath.length > 0) {
      const lastChapter = detail.chapterPath[detail.chapterPath.length - 1];
      revalidatePath(toChapterDetailPath(lastChapter.id));
    }
    revalidatePath(toUnitDetailPath(detail.unit.id));
    revalidatePath(toQuestionDetailPath(detail.question.id));

    return {
      status: "success",
      redirect: toQuestionDetailPath(detail.question.id),
      message: "問題を更新しました。",
    } satisfies FormState;
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
        error instanceof Error ? error.message : "問題の更新に失敗しました。",
    } satisfies FormState;
  }
}

export default async function QuestionEditPage({
  params,
}: PageProps<"/questions/[questionId]/edit">) {
  const { questionId } = await params;
  const detail = await getQuestionDetail({ questionId }).catch(() => null);

  if (!detail) {
    notFound();
  }

  const currentChapter =
    detail.chapterPath.length > 0
      ? detail.chapterPath[detail.chapterPath.length - 1]
      : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toQuestionDetailPath(detail.question.id)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 問題詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">問題を編集</h1>
        <p className="text-sm text-gray-600">
          UNIT「{detail.unit.name}」配下の問題を編集します。
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <QuestionEditForm
          action={handleUpdateQuestion}
          defaultValues={{
            questionId: detail.question.id,
            unitId: detail.unit.id,
            japanese: detail.question.japanese,
            hint: detail.question.hint,
            explanation: detail.question.explanation,
            order: detail.question.order,
            correctAnswers: detail.question.correctAnswers.map(
              (answer) => answer.answerText,
            ),
          }}
        />
      </section>

      <section className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <p>
          親階層: {detail.material.name} /{" "}
          {detail.chapterPath.map((chapter) => chapter.name).join(" / ")} /{" "}
          {detail.unit.name}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={toUnitDetailPath(detail.unit.id)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            UNIT詳細へ戻る
          </Link>
          {currentChapter ? (
            <Link
              href={toChapterDetailPath(currentChapter.id)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              章詳細へ戻る
            </Link>
          ) : null}
          <Link
            href={toMaterialDetailPath(detail.material.id)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            教材詳細へ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
