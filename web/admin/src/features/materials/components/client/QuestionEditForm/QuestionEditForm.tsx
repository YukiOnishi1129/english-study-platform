"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";

interface QuestionEditFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaultValues: {
    questionId: string;
    unitId: string;
    japanese: string;
    hint: string | null;
    explanation: string | null;
    order: number;
    correctAnswers: string[];
  };
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
    >
      {status.pending ? "保存中..." : "変更を保存"}
    </button>
  );
}

export function QuestionEditForm(props: QuestionEditFormProps) {
  const [state, formAction] = useActionState(props.action, initialFormState);
  const defaultAnswers = props.defaultValues.correctAnswers.join("\n");

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="questionId"
        value={props.defaultValues.questionId}
      />
      <input type="hidden" name="unitId" value={props.defaultValues.unitId} />

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
          defaultValue={props.defaultValues.japanese}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="question-correct-answers"
          className="text-sm font-semibold text-gray-800"
        >
          英語正解 <span className="text-red-500">*</span>
        </label>
        <textarea
          id="question-correct-answers"
          name="correctAnswers"
          required
          rows={5}
          defaultValue={defaultAnswers}
          placeholder={"1行につき1つの正解を入力してください"}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <p className="text-xs text-gray-500">
          1行につき1つの正解を入力します。表示順は上から順に適用されます。
        </p>
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
            defaultValue={props.defaultValues.order}
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
            defaultValue={props.defaultValues.hint ?? ""}
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
          defaultValue={props.defaultValues.explanation ?? ""}
          className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-red-600">
          {state.message ?? "保存に失敗しました。"}
        </p>
      ) : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
