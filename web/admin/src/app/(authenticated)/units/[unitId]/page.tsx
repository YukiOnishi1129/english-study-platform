import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getUnitDetail } from "@/external/handler/material/material.query.server";
import { UnitQuestionCsvImporter } from "@/features/materials/components/client/UnitQuestionCsvImporter";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toUnitEditPath,
} from "@/features/materials/lib/paths";

interface PageProps {
  params: {
    unitId: string;
  };
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  try {
    const detail = await getUnitDetail({ unitId: props.params.unitId });
    return {
      title: `${detail.unit.name} | ${detail.material.name} - English Study Admin`,
      description: `${detail.material.name} / ${detail.unit.name} の問題管理ページ`,
    };
  } catch {
    notFound();
  }
}

export default async function UnitDetailPage(props: PageProps) {
  const detail = await getUnitDetail({ unitId: props.params.unitId }).catch(
    () => null,
  );

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
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">日本語</th>
                  <th className="px-4 py-3">英語正解</th>
                  <th className="px-4 py-3">ヒント</th>
                  <th className="px-4 py-3">解説</th>
                  <th className="px-4 py-3">最終更新</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {detail.questions.map((question) => (
                  <tr key={question.id} className="align-top">
                    <td className="px-4 py-3 text-xs font-semibold text-gray-500">
                      {question.order}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-900">
                      {question.japanese}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="list-disc space-y-1 pl-5">
                        {question.correctAnswers.map((answer) => (
                          <li key={answer.id}>{answer.answerText}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-600">
                      {question.hint ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap text-gray-600">
                      {question.explanation ?? (
                        <span className="text-xs text-gray-400">―</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(question.updatedAt).toLocaleString("ja-JP")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
