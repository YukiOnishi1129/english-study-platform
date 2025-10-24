import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionDetailAction } from "@/external/handler/material/material.query.action";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import { QuestionEditForm } from "@/features/questions/components/client/QuestionEditForm";
import { ensureQuestionDetail } from "@/features/questions/queries/validation";

export const dynamic = "force-dynamic";

interface QuestionEditPageTemplateProps {
  questionId: string;
}

export async function QuestionEditPageTemplate({
  questionId,
}: QuestionEditPageTemplateProps) {
  const detail = await getQuestionDetailAction({ questionId });

  if (!detail) {
    notFound();
  }

  const parsed = ensureQuestionDetail(detail);

  const currentChapter =
    parsed.chapterPath.length > 0
      ? parsed.chapterPath[parsed.chapterPath.length - 1]
      : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-10">
      <nav className="text-sm text-gray-500">
        <Link
          href={toQuestionDetailPath(parsed.question.id)}
          className="inline-flex items-center gap-1 text-indigo-600 underline-offset-2 hover:underline"
        >
          ← 問題詳細に戻る
        </Link>
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">問題を編集</h1>
        <p className="text-sm text-gray-600">
          UNIT「{parsed.unit.name}」配下の問題を編集します。
        </p>
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <QuestionEditForm
          defaultValues={{
            questionId: parsed.question.id,
            unitId: parsed.unit.id,
            japanese: parsed.question.japanese,
            hint: parsed.question.hint,
            explanation: parsed.question.explanation,
            order: parsed.question.order,
            correctAnswers: parsed.question.correctAnswers.map(
              (answer) => answer.answerText,
            ),
          }}
          context={{
            materialId: parsed.material.id,
            chapterIds: parsed.chapterPath.map((chapter) => chapter.id),
          }}
        />
      </section>

      <section className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        <p>
          親階層: {parsed.material.name} /{" "}
          {parsed.chapterPath.map((chapter) => chapter.name).join(" / ")} /{" "}
          {parsed.unit.name}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href={toUnitDetailPath(parsed.unit.id)}
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
            href={toMaterialDetailPath(parsed.material.id)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            教材詳細へ戻る
          </Link>
        </div>
      </section>
    </main>
  );
}
