"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import {
  toQuestionDetailPath,
  toQuestionEditPath,
} from "@/features/materials/lib/paths";

interface QuestionItem {
  id: string;
  order: number;
  japanese: string;
  updatedAt: string;
}

interface QuestionReorderTableProps {
  questions: QuestionItem[];
  serverActionArgs: {
    unitId: string;
    materialId: string;
    chapterIds: string[];
  };
  reorderUnitQuestionsAction: (data: {
    unitId: string;
    materialId: string;
    chapterIds: string[];
    orderedQuestionIds: string[];
  }) => Promise<{ success: boolean; message?: string }>;
}

interface SortableRowProps {
  item: QuestionItem;
  disabled: boolean;
}

function SortableRow(props: SortableRowProps) {
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

export function QuestionReorderTable({
  questions,
  serverActionArgs,
  reorderUnitQuestionsAction,
}: QuestionReorderTableProps) {
  const [items, setItems] = useState<QuestionItem[]>(
    questions.map((item) => ({ ...item })),
  );
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setItems(questions.map((item) => ({ ...item })));
  }, [questions]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previousItems = items.map((item) => ({ ...item }));
    const reordered = arrayMove(items, oldIndex, newIndex).map(
      (item, index) => ({ ...item, order: index + 1 }),
    );

    setItems(reordered);

    startTransition(async () => {
      try {
        const result = await reorderUnitQuestionsAction({
          unitId: serverActionArgs.unitId,
          materialId: serverActionArgs.materialId,
          chapterIds: serverActionArgs.chapterIds,
          orderedQuestionIds: reordered.map((item) => item.id),
        });

        if (!result.success) {
          setItems(previousItems);
          setErrorMessage(result.message ?? "問題の並び順更新に失敗しました。");
          return;
        }

        setSuccessMessage(result.message ?? "問題の並び順を更新しました。");
      } catch (error) {
        setItems(previousItems);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "問題の並び順更新に失敗しました。",
        );
      }
    });
  };

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
                <Link
                  href={toQuestionDetailPath(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm"
                >
                  詳細
                </Link>
                <Link
                  href={toQuestionEditPath(item.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 shadow-sm"
                >
                  編集
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-600">
          問題をドラッグして並び替え
        </span>
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
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((item) => item.id)}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableRow key={item.id} item={item} disabled={isPending} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
