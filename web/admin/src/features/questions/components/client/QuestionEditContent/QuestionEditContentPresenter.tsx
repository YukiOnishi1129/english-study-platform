import type { QuestionDetailDto } from "@/external/dto/material/material.query.dto";
import { QuestionEditForm } from "@/features/questions/components/client/QuestionEditForm";

interface QuestionEditContentPresenterProps {
  detail: QuestionDetailDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function QuestionEditContentPresenter(
  props: QuestionEditContentPresenterProps,
) {
  const { detail, isLoading, isError } = props;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-10 animate-pulse rounded bg-gray-200" />
        <div className="h-16 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        問題の情報を取得できませんでした。時間を置いて再度お試しください。
      </div>
    );
  }

  return (
    <QuestionEditForm
      defaultValues={{
        questionId: detail.question.id,
        unitId: detail.unit.id,
        japanese: detail.question.japanese,
        prompt: detail.question.prompt,
        annotation: detail.question.annotation,
        hint: detail.question.hint,
        explanation: detail.question.explanation,
        order: detail.question.order,
        correctAnswers: detail.question.correctAnswers.map(
          (answer) => answer.answerText,
        ),
        vocabulary: detail.vocabularyEntry
          ? {
              vocabularyEntryId: detail.vocabularyEntry.id,
              headword: detail.vocabularyEntry.headword,
              pronunciation: detail.vocabularyEntry.pronunciation,
              partOfSpeech: detail.vocabularyEntry.partOfSpeech,
              memo: detail.vocabularyEntry.memo,
              synonyms: detail.vocabularyEntry.relations
                .filter((relation) => relation.relationType === "synonym")
                .map((relation) => relation.relatedText),
              antonyms: detail.vocabularyEntry.relations
                .filter((relation) => relation.relationType === "antonym")
                .map((relation) => relation.relatedText),
              relatedWords: detail.vocabularyEntry.relations
                .filter((relation) => relation.relationType === "related")
                .map((relation) => relation.relatedText),
              exampleSentenceEn: detail.vocabularyEntry.exampleSentenceEn,
              exampleSentenceJa: detail.vocabularyEntry.exampleSentenceJa,
            }
          : null,
      }}
      context={{
        materialId: detail.material.id,
        chapterIds: detail.chapterPath.map((chapter) => chapter.id),
      }}
    />
  );
}
