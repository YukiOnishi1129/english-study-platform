"use client";

import { FormSubmitButton } from "@/shared/components/ui/form-submit-button";

export interface ChapterCreateFormPresenterProps {
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
  contextLabel: string;
  status: "idle" | "success" | "error";
  message?: string;
  isPending: boolean;
  onSubmit: (formData: FormData) => Promise<void>;
}

export function ChapterCreateFormPresenter(
  props: ChapterCreateFormPresenterProps,
) {
  const {
    materialId,
    parentChapterId,
    contextLabel,
    status,
    message,
    isPending,
    onSubmit,
  } = props;

  const parentId = parentChapterId ?? "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await onSubmit(formData);
    event.currentTarget.reset();
  }

  return (
    <div className="space-y-2 rounded-md border border-sky-200 bg-sky-50/60 p-4 text-sm text-gray-700">
      <p className="text-xs font-semibold text-sky-700">{contextLabel}</p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input type="hidden" name="materialId" value={materialId} />
        <input type="hidden" name="parentChapterId" value={parentId} />
        <div className="space-y-1">
          <label
            htmlFor={`chapter-name-${materialId}-${parentId || "root"}`}
            className="text-xs font-medium text-gray-800"
          >
            章の名称 <span className="text-red-500">*</span>
          </label>
          <input
            id={`chapter-name-${materialId}-${parentId || "root"}`}
            name="name"
            type="text"
            required
            maxLength={120}
            placeholder="例: 第1章 あいさつ"
            className="w-full rounded-md border border-sky-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`chapter-desc-${materialId}-${parentId || "root"}`}
            className="text-xs font-medium text-gray-800"
          >
            説明
          </label>
          <textarea
            id={`chapter-desc-${materialId}-${parentId || "root"}`}
            name="description"
            rows={2}
            maxLength={500}
            placeholder="章の補足説明（任意）"
            className="w-full rounded-md border border-sky-200 bg-white px-3 py-1.5 text-xs text-gray-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </div>
        <div className="flex items-center justify-between">
          {status === "success" ? (
            <span className="text-xs text-emerald-600">章を追加しました。</span>
          ) : status === "error" ? (
            <span className="text-xs text-red-600">
              {message ?? "追加に失敗しました。"}
            </span>
          ) : (
            <span className="text-[11px] text-sky-600">
              必要なら後から階層を編集できます。
            </span>
          )}
          <FormSubmitButton
            pendingLabel="追加中..."
            variant="outline"
            className="inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-300"
            isPending={isPending}
          >
            章を追加
          </FormSubmitButton>
        </div>
      </form>
    </div>
  );
}
