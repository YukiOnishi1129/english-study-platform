"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import {
  toQuestionDetailPath,
  toQuestionEditPath,
} from "@/features/materials/lib/paths";
import type { QuestionReorderTableItem } from "./types";

interface QuestionReorderTableRowProps {
  item: QuestionReorderTableItem;
  disabled: boolean;
}

export function QuestionReorderTableRow(props: QuestionReorderTableRowProps) {
  const { item, disabled } = props;
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-[auto_1fr_auto] items-start gap-4 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm transition ${isDragging ? "ring-2 ring-indigo-400" : "hover:border-indigo-200"}`}
    >
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-500 transition hover:bg-gray-100 focus:outline-none"
        aria-label="ドラッグして並び替え"
        {...attributes}
        {...listeners}
      >
        <span className="text-lg leading-none">⋮⋮</span>
      </button>
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
        <Link
          href={toQuestionDetailPath(item.id)}
          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50"
        >
          詳細
        </Link>
        <Link
          href={toQuestionEditPath(item.id)}
          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
        >
          編集
        </Link>
      </div>
    </div>
  );
}
