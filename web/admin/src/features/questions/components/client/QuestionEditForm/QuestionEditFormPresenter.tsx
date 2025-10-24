"use client";

import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";
import type { QuestionEditFormPresenterProps } from "./types";

export function QuestionEditFormPresenter(
  props: QuestionEditFormPresenterProps,
) {
  const {
    defaultValues,
    answers,
    status,
    message,
    isPending,
    onSubmit,
    onAddAnswer,
    onAnswerChange,
    onRemoveAnswer,
    isRemoveDisabled,
  } = props;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="questionId" value={defaultValues.questionId} />
      <input type="hidden" name="unitId" value={defaultValues.unitId} />

      <div className="space-y-1">
        <label
          htmlFor="question-japanese"
          className="text-sm font-semibold text-gray-800"
        >
          日本語 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="question-japanese"
          name="japanese"
          required
          rows={3}
          defaultValue={defaultValues.japanese}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            className="text-sm font-semibold text-gray-800"
            htmlFor="question-correct-answer-0"
          >
            英語正解 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={onAddAnswer}
            className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            正解を追加
          </button>
        </div>
        <p className="text-xs text-gray-500">
          表示順に応じて上から順に並べ替えてください。少なくとも1件入力が必要です。
        </p>
        <div className="space-y-2">
          {answers.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <input
                id={`question-correct-answer-${index}`}
                name="correctAnswers"
                type="text"
                required
                value={field.value}
                onChange={(event) =>
                  onAnswerChange(field.id, event.target.value)
                }
                className="flex-1 rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={() => onRemoveAnswer(field.id)}
                disabled={isRemoveDisabled}
                className="inline-flex items-center rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="正解を削除"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="question-order"
            className="text-sm font-semibold text-gray-800"
          >
            並び順
          </label>
          <input
            id="question-order"
            name="order"
            type="number"
            min={1}
            placeholder="変更しない場合は空欄"
            defaultValue={defaultValues.order}
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <p className="text-xs text-gray-500">
            UNIT内の表示順です。空欄の場合は現状の順序を維持します。
          </p>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="question-hint"
            className="text-sm font-semibold text-gray-800"
          >
            ヒント
          </label>
          <textarea
            id="question-hint"
            name="hint"
            rows={3}
            defaultValue={defaultValues.hint ?? ""}
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label
          htmlFor="question-explanation"
          className="text-sm font-semibold text-gray-800"
        >
          解説
        </label>
        <textarea
          id="question-explanation"
          name="explanation"
          rows={4}
          defaultValue={defaultValues.explanation ?? ""}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {status === "error" ? (
        <p className="text-sm text-red-600">
          {message ?? "保存に失敗しました。"}
        </p>
      ) : null}

      {status === "success" ? (
        <p className="text-sm text-emerald-600">問題を更新しました。</p>
      ) : null}

      <div className="flex justify-end">
        <FormSubmitButton pendingLabel="保存中..." isPending={isPending}>
          変更を保存
        </FormSubmitButton>
      </div>
    </form>
  );
}
