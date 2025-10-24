"use client";

import Link from "next/link";
import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";
import type { UnitCreateFormPresenterProps } from "./types";

export function UnitCreateFormPresenter(props: UnitCreateFormPresenterProps) {
  const { state, formAction, chapterId, chapterName, materialId } = props;

  return (
    <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-gray-700">
      <p className="text-xs font-semibold text-emerald-700">
        「{chapterName}」にUNITを追加
      </p>
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="chapterId" value={chapterId} />
        <input type="hidden" name="materialId" value={materialId} />
        <div className="space-y-1">
          <label
            htmlFor={`unit-name-${chapterId}`}
            className="text-xs font-medium text-gray-800"
          >
            UNIT名 <span className="text-red-500">*</span>
          </label>
          <input
            id={`unit-name-${chapterId}`}
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
            htmlFor={`unit-desc-${chapterId}`}
            className="text-xs font-medium text-gray-800"
          >
            説明
          </label>
          <textarea
            id={`unit-desc-${chapterId}`}
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
          <FormSubmitButton
            pendingLabel="追加中..."
            variant="outline"
            className="border-emerald-200 bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
          >
            UNITを追加
          </FormSubmitButton>
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
