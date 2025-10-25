import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { QuestionDetailDto } from "@/external/dto/material/material.query.dto";
import { getQuestionDetail } from "@/external/handler/material/material.query.server";
import {
  toChapterDetailPath,
  toMaterialDetailPath,
  toQuestionDetailPath,
  toUnitDetailPath,
} from "@/features/materials/lib/paths";
import { QuestionEditContent } from "@/features/questions/components/client/QuestionEditContent";
import { questionKeys } from "@/features/questions/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

interface QuestionEditPageTemplateProps {
  questionId: string;
}

export async function QuestionEditPageTemplate({
  questionId,
}: QuestionEditPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: questionKeys.detail(questionId),
      queryFn: () => getQuestionDetail({ questionId }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "QUESTION_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const parsed = queryClient.getQueryData<QuestionDetailDto>(
    questionKeys.detail(questionId),
  );

  if (!parsed) {
    notFound();
  }

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
        <HydrationBoundary state={dehydrate(queryClient)}>
          <QuestionEditContent questionId={questionId} />
        </HydrationBoundary>
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
