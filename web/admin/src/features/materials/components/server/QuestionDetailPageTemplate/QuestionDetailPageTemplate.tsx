import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import { QuestionDeleteButton } from "@/features/materials/components/client/QuestionDeleteButton";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionEditPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";

export const dynamic = "force-dynamic";

interface QuestionDetailPageTemplateProps {
  questionId: string;
}

export async function QuestionDetailPageTemplate(
  props: QuestionDetailPageTemplateProps,
) {
  const detail = await getQuestionDetail({
    questionId: props.questionId,
  }).catch(() => null);

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-10">
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
          <li>
            <span className="mx-1">›</span>
            <Link
              href={toUnitDetailPath(detail.unit.id)}
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              {detail.unit.name}
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span>›</span>
            <span className="font-semibold text-gray-700">問題詳細</span>
          </li>
        </ol>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">問題の詳細</h1>
          <p className="text-sm text-gray-600">
            UNIT「{detail.unit.name}」配下の問題です。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={toQuestionEditPath(detail.question.id)}
            className="inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            問題を編集
          </Link>
          <Link
            href={toUnitDetailPath(detail.unit.id)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
          >
            UNIT詳細へ戻る
          </Link>
        </div>
      </header>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">問題文</h2>
          <p className="whitespace-pre-wrap text-gray-900">
            {detail.question.japanese}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">英語正解</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
            {detail.question.correctAnswers.map((answer) => (
              <li key={answer.id}>{answer.answerText}</li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-800">ヒント</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {detail.question.hint ?? (
                <span className="text-xs text-gray-400">
                  登録されていません
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-800">解説</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">
              {detail.question.explanation ?? (
                <span className="text-xs text-gray-400">
                  登録されていません
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              並び順
            </h4>
            <p className="mt-1 text-sm text-gray-700">
              #{detail.question.order}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              最終更新
            </h4>
            <p className="mt-1 text-sm text-gray-700">
              {new Date(detail.question.updatedAt).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      </section>

      <QuestionDeleteButton
        questionId={detail.question.id}
        unitId={detail.unit.id}
      />
    </main>
  );
}
