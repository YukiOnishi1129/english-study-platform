"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";

interface UnitCreateFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  chapterId: string;
  chapterName: string;
  materialId: string;
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
    >
      {status.pending ? "追加中..." : "UNITを追加"}
    </button>
  );
}

export function UnitCreateForm(props: UnitCreateFormProps) {
  const [state, formAction] = useActionState(props.action, initialFormState);

  return (
    <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-gray-700">
      <p className="text-xs font-semibold text-emerald-700">
        「{props.chapterName}」にUNITを追加
      </p>
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="chapterId" value={props.chapterId} />
        <input type="hidden" name="materialId" value={props.materialId} />
        <div className="space-y-1">
          <label
            htmlFor={`unit-name-${props.chapterId}`}
            className="text-xs font-medium text-gray-800"
          >
            UNIT名 <span className="text-red-500">*</span>
          </label>
          <input
            id={`unit-name-${props.chapterId}`}
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="例: Unit1 朝の挨拶"
            className="w-full rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`unit-desc-${props.chapterId}`}
            className="text-xs font-medium text-gray-800"
          >
            説明
          </label>
          <textarea
            id={`unit-desc-${props.chapterId}`}
            name="description"
            rows={2}
            maxLength={500}
            placeholder="UNITの補足説明（任意）"
            className="w-full rounded-md border border-emerald-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
        <div className="flex items-center justify-between">
          {state.status === "success" ? (
            <span className="text-xs text-emerald-600">
              UNITを追加しました。
            </span>
          ) : state.status === "error" ? (
            <span className="text-xs text-red-600">
              {state.message ?? "追加に失敗しました。"}
            </span>
          ) : (
            <span className="text-[11px] text-emerald-600">
              作成後は詳細画面から問題CSVを取り込みできます。
            </span>
          )}
          <SubmitButton />
        </div>
      </form>
      {state.redirect ? (
        <p className="text-[11px] text-indigo-600">
          <Link
            href={state.redirect}
            className="underline-offset-2 hover:underline"
          >
            作成したUNITの詳細へ移動する
          </Link>
        </p>
      ) : null}
    </div>
  );
}
