"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/features/materials/types/formState";
import { initialFormState } from "@/features/materials/types/formState";

interface MaterialCreateFormProps {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}

function SubmitButton() {
  const status = useFormStatus();
  return (
    <button
      type="submit"
      disabled={status.pending}
      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-300"
    >
      {status.pending ? "作成中..." : "教材を作成"}
    </button>
  );
}

export function MaterialCreateForm(props: MaterialCreateFormProps) {
  const [state, formAction] = useActionState(props.action, initialFormState);

  return (
    <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-6 shadow-sm">
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="material-name"
            className="text-sm font-semibold text-gray-800"
          >
            教材名 <span className="text-red-500">*</span>
          </label>
          <input
            id="material-name"
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="例: 基礎英会話"
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="material-description"
            className="text-sm font-semibold text-gray-800"
          >
            説明
          </label>
          <textarea
            id="material-description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="教材の目的や概要を記載できます（任意）"
            className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-indigo-700">
            作成後は章とUNITを追加して構成を整えます。
          </p>
          <SubmitButton />
        </div>

        {state.status === "error" ? (
          <p className="text-sm text-red-600">
            {state.message ?? "作成に失敗しました。"}
          </p>
        ) : null}
        {state.status === "success" ? (
          <div className="space-y-1 text-sm">
            <p className="text-emerald-600">教材を作成しました。</p>
            {state.redirect ? (
              <Link
                href={state.redirect}
                className="inline-flex items-center gap-1 text-indigo-600 underline-offset-4 hover:underline"
              >
                教材の詳細管理へ進む →
              </Link>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  );
}
