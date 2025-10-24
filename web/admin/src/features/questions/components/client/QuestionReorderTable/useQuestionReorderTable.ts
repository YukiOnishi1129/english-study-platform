"use client";

import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useEffect, useState, useTransition } from "react";
import type {
  QuestionReorderTableItem,
  QuestionReorderTablePresenterProps,
  QuestionReorderTableProps,
} from "./types";

type UseQuestionReorderTableResult = QuestionReorderTablePresenterProps;

export function useQuestionReorderTable(
  props: QuestionReorderTableProps,
): UseQuestionReorderTableResult {
  const { questions, reorderUnitQuestionsAction, serverActionArgs } = props;
  const [items, setItems] = useState<QuestionReorderTableItem[]>(() =>
    questions.map((item) => ({ ...item })),
  );
  const [isMounted, setIsMounted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
            setErrorMessage(
              result.message ?? "問題の並び順更新に失敗しました。",
            );
            return;
          }

          setErrorMessage(null);
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
    },
    [
      items,
      reorderUnitQuestionsAction,
      serverActionArgs.chapterIds,
      serverActionArgs.materialId,
      serverActionArgs.unitId,
    ],
  );

  return {
    questions,
    items,
    isMounted,
    isPending,
    successMessage,
    errorMessage,
    sensors,
    onDragEnd: handleDragEnd,
  };
}
