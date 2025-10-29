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

  const vocabulary = defaultValues.vocabulary ?? null;
  const synonymDefault = vocabulary ? vocabulary.synonyms.join("\n") : "";
  const antonymDefault = vocabulary ? vocabulary.antonyms.join("\n") : "";
  const relatedDefault = vocabulary ? vocabulary.relatedWords.join("\n") : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="questionId" value={defaultValues.questionId} />
      <input type="hidden" name="unitId" value={defaultValues.unitId} />
      {vocabulary ? (
        <input
          type="hidden"
          name="vocabularyEntryId"
          value={vocabulary.vocabularyEntryId}
        />
      ) : null}

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

      <div className="space-y-1">
        <label
          htmlFor="question-prompt"
          className="text-sm font-semibold text-gray-800"
        >
          プロンプト
        </label>
        <textarea
          id="question-prompt"
          name="prompt"
          rows={2}
          defaultValue={defaultValues.prompt ?? ""}
          placeholder="例: 単語の品詞を入力してください（任意）"
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p className="text-xs text-gray-500">
          語彙問題で追加の指示文を表示したい場合に入力します。（任意）
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label
            className="text-sm font-semibold text-gray-800"
            htmlFor="question-correct-answer-0"
          >
            正解候補 <span className="text-red-500">*</span>
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

      {vocabulary ? (
        <section className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/40 p-4">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-indigo-900">語彙情報</h2>
            <p className="text-xs text-indigo-700">
              英単語や類義語などの語彙情報を編集します。空欄のフィールドは未設定として扱われます。
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-headword"
                className="text-sm font-semibold text-gray-800"
              >
                英単語 <span className="text-red-500">*</span>
              </label>
              <input
                id="vocabulary-headword"
                name="headword"
                type="text"
                required
                defaultValue={vocabulary.headword}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-part-of-speech"
                className="text-sm font-semibold text-gray-800"
              >
                品詞
              </label>
              <input
                id="vocabulary-part-of-speech"
                name="partOfSpeech"
                type="text"
                placeholder="例: noun, adjective"
                defaultValue={vocabulary.partOfSpeech ?? ""}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-pronunciation"
                className="text-sm font-semibold text-gray-800"
              >
                発音
              </label>
              <input
                id="vocabulary-pronunciation"
                name="pronunciation"
                type="text"
                placeholder="例: kən-ˈven-shə-nᵊl"
                defaultValue={vocabulary.pronunciation ?? ""}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-memo"
                className="text-sm font-semibold text-gray-800"
              >
                追加の日本語訳 / メモ
              </label>
              <textarea
                id="vocabulary-memo"
                name="vocabularyMemo"
                rows={2}
                placeholder="例: 慣習的な / 従来の"
                defaultValue={vocabulary.memo ?? ""}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-synonyms"
                className="text-sm font-semibold text-gray-800"
              >
                類義語
              </label>
              <textarea
                id="vocabulary-synonyms"
                name="synonyms"
                rows={3}
                placeholder="改行またはカンマで区切って入力してください"
                defaultValue={synonymDefault}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-antonyms"
                className="text-sm font-semibold text-gray-800"
              >
                対義語
              </label>
              <textarea
                id="vocabulary-antonyms"
                name="antonyms"
                rows={3}
                placeholder="改行またはカンマで区切って入力してください"
                defaultValue={antonymDefault}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-related"
                className="text-sm font-semibold text-gray-800"
              >
                関連語
              </label>
              <textarea
                id="vocabulary-related"
                name="relatedWords"
                rows={3}
                placeholder="改行またはカンマで区切って入力してください"
                defaultValue={relatedDefault}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-example-en"
                className="text-sm font-semibold text-gray-800"
              >
                例文（英語）
              </label>
              <textarea
                id="vocabulary-example-en"
                name="exampleSentenceEn"
                rows={3}
                defaultValue={vocabulary.exampleSentenceEn ?? ""}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="vocabulary-example-ja"
                className="text-sm font-semibold text-gray-800"
              >
                例文（日本語）
              </label>
              <textarea
                id="vocabulary-example-ja"
                name="exampleSentenceJa"
                rows={3}
                defaultValue={vocabulary.exampleSentenceJa ?? ""}
                className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </section>
      ) : null}

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
