"use client";

import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";
import type { UnitCreateFormPresenterProps } from "./types";

export function UnitCreateFormPresenter(props: UnitCreateFormPresenterProps) {
  const {
    status,
    message,
    isPending,
    onSubmit,
    chapterId,
    chapterName,
    materialId,
  } = props;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await onSubmit(formData);
    form.reset();
  }

  return (
    <div className="space-y-2 rounded-md border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-gray-700">
      <p className="text-xs font-semibold text-emerald-700">
        「{chapterName}」にUNITを追加
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
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
          {status === "success" ? (
            <span className="text-xs text-emerald-600">
              UNITを追加しました。
            </span>
          ) : status === "error" ? (
            <span className="text-xs text-red-600">
              {message ?? "追加に失敗しました。"}
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
            isPending={isPending}
          >
            UNITを追加
          </FormSubmitButton>
        </div>
      </form>
    </div>
  );
}
