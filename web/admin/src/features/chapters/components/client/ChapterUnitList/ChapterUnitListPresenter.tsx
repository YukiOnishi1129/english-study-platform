"use client";

import Link from "next/link";
import { toUnitDetailPath } from "@/features/materials/lib/paths";
import type { ChapterUnitListPresenterProps } from "./types";

export function ChapterUnitListPresenter(props: ChapterUnitListPresenterProps) {
  const {
    items,
    isSaving,
    successMessage,
    errorMessage,
    draggingId,
    hoverId,
    isDisabled,
    onDragStart,
    onDragOver,
    onDragLeave,
    onItemDrop,
    onListDrop,
    onDragEnd,
  } = props;

  return (
    <div className="space-y-3 rounded-md border border-indigo-100 bg-indigo-50/40 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-indigo-700">
          UNIT一覧（ドラッグで並び替え）
        </span>
        {isSaving ? (
          <span className="text-indigo-600">保存中...</span>
        ) : successMessage ? (
          <span className="text-emerald-600">{successMessage}</span>
        ) : errorMessage ? (
          <span className="text-red-600">{errorMessage}</span>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-indigo-200 bg-white px-3 py-2 text-xs text-gray-500">
          UNITが登録されていません。
        </p>
      ) : (
        <ul
          className="space-y-2"
          onDragOver={(event) => onDragOver(event, null)}
          onDrop={onListDrop}
        >
          {items.map((unit, index) => {
            const isDraggingItem = draggingId === unit.id;
            const isHoverTarget = hoverId === unit.id && !isDraggingItem;

            return (
              <li
                key={unit.id}
                draggable={!isDisabled}
                onDragStart={(event) => onDragStart(event, unit.id)}
                onDragOver={(event) => onDragOver(event, unit.id)}
                onDragLeave={(event) => onDragLeave(event, unit.id)}
                onDrop={(event) => onItemDrop(event, index)}
                onDragEnd={onDragEnd}
                className={`flex items-center gap-3 rounded-md border bg-white px-3 py-2 shadow-sm transition ${isDraggingItem ? "opacity-75 ring-2 ring-indigo-400" : ""} ${isHoverTarget ? "border-dashed border-indigo-400 bg-indigo-50/60" : "border-indigo-100 hover:border-indigo-200"}`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 text-indigo-500">
                  <span className="text-lg leading-none">⋮⋮</span>
                </div>
                <div className="flex flex-1 flex-col">
                  <Link
                    href={toUnitDetailPath(unit.id)}
                    className="text-sm font-medium text-indigo-700 underline-offset-2 transition hover:text-indigo-900 hover:underline"
                  >
                    {unit.name}
                  </Link>
                  {unit.description ? (
                    <p className="text-xs text-gray-500">{unit.description}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-3.5 w-3.5 opacity-80"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v2.036l1.451.967a.75.75 0 11-.832 1.248l-2-1.333A.75.75 0 019.25 9.75v-3zM10 13a.75.75 0 100 1.5.75.75 0 000-1.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-semibold">
                      {unit.questionCount}
                    </span>
                    <span className="text-[11px] opacity-80">問</span>
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    #{unit.order}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11px] text-gray-500">
        並び順は章内で共有されます。ドラッグ後に自動保存されます。
      </p>
    </div>
  );
}
