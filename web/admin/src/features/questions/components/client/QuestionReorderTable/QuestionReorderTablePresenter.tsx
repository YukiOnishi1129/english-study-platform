"use client";

import { DndContext } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext } from "@dnd-kit/sortable";
import { useEffect, useMemo, useRef } from "react";
import { QuestionReorderTableRow } from "./QuestionReorderTableRow";
import type { QuestionReorderTablePresenterProps } from "./types";

export function QuestionReorderTablePresenter(
  props: QuestionReorderTablePresenterProps,
) {
  const {
    questions,
    items,
    isMounted,
    isPending,
    successMessage,
    errorMessage,
    sensors,
    onDragEnd,
    selectable,
    selectedIds,
    onToggleSelect,
    onToggleSelectAll,
  } = props;

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const totalCount = items.length;
  const selectedCount = selectedIds.length;
  const allSelected =
    selectable && totalCount > 0 && selectedCount === totalCount;
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectable && selectedCount > 0 && !allSelected;
    }
  }, [selectable, selectedCount, allSelected]);

  if (!isMounted) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600">問題一覧</span>
          <span className="text-gray-400">読み込み中...</span>
        </div>
        <div className="space-y-2">
          {questions.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">
                    #{item.order}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {item.japanese}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  最終更新: {new Date(item.updatedAt).toLocaleString("ja-JP")}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-1 rounded-md border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-400">
                  詳細
                </span>
                <span className="inline-flex items-center gap-1 rounded-md border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-400">
                  編集
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-600">
            問題をドラッグして並び替え
          </span>
          {selectable ? (
            <label className="flex items-center gap-2 text-[11px] text-gray-500">
              <input
                type="checkbox"
                className="size-4 cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={allSelected}
                ref={selectAllRef}
                disabled={totalCount === 0}
                onChange={(event) =>
                  onToggleSelectAll?.(event.currentTarget.checked)
                }
                aria-label="すべて選択"
              />
              全選択 ({selectedCount}/{totalCount})
            </label>
          ) : null}
        </div>
        {isPending ? (
          <span className="text-indigo-600">保存中...</span>
        ) : successMessage ? (
          <span className="text-emerald-600">{successMessage}</span>
        ) : errorMessage ? (
          <span className="text-red-600">{errorMessage}</span>
        ) : null}
      </div>
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)}>
          <div className="space-y-2">
            {items.map((item) => (
              <QuestionReorderTableRow
                key={item.id}
                item={item}
                disabled={isPending}
                selectable={selectable}
                selected={selectedSet.has(item.id)}
                onToggleSelect={onToggleSelect}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
