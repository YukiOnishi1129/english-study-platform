"use client";

import Link from "next/link";
import type { FormState } from "@/features/materials/types/formState";
import { SubmitButton } from "./SubmitButton";

export interface ChapterCreateFormPresenterProps {
  materialId: string;
  parentChapterId?: string;
  parentChapterName?: string;
  contextLabel: string;
  state: FormState;
  formAction: (formData: FormData) => void;
}

export function ChapterCreateFormPresenter(
  props: ChapterCreateFormPresenterProps,
) {
  const { materialId, parentChapterId, contextLabel, state, formAction } =
    props;

  const parentId = parentChapterId ?? "";

  return (
    <div className="space-y-2 rounded-md border border-sky-200 bg-sky-50/60 p-4 text-sm text-gray-700">
      <p className="text-xs font-semibold text-sky-700">{contextLabel}</p>
      <form action={formAction} className="space-y-2">
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
          {state.status === "success" ? (
            <span className="text-xs text-emerald-600">章を追加しました。</span>
          ) : state.status === "error" ? (
            <span className="text-xs text-red-600">
              {state.message ?? "追加に失敗しました。"}
            </span>
          ) : (
            <span className="text-[11px] text-sky-600">
              必要なら後から階層を編集できます。
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
            詳細ページを開く
          </Link>
        </p>
      ) : null}
    </div>
  );
}
