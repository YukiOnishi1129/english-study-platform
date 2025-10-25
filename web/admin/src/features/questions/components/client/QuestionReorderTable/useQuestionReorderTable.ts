"use client";

import {
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import { questionKeys } from "@/features/questions/queries/keys";
import { unitKeys } from "@/features/units/queries/keys";
import { reorderQuestionsAction } from "./actions";
import type {
  QuestionReorderTablePresenterProps,
  QuestionReorderTableProps,
} from "./types";

interface MutationVariables {
  orderedItems: QuestionReorderTablePresenterProps["items"];
  previousItems: QuestionReorderTablePresenterProps["items"];
}

export function useQuestionReorderTable(
  props: QuestionReorderTableProps,
): QuestionReorderTablePresenterProps {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(() =>
    [...props.questions].sort((a, b) => a.order - b.order),
  );
  const [isMounted, setIsMounted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setItems([...props.questions].sort((a, b) => a.order - b.order));
  }, [props.questions]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const mutation = useMutation({
    mutationFn: async (variables: MutationVariables) => {
      const payload = {
        unitId: props.unitId,
        materialId: props.materialId,
        chapterIds: props.chapterIds,
        orderedQuestionIds: variables.orderedItems.map((item) => item.id),
      };

      const result = await reorderQuestionsAction(payload);
      if (!result.success) {
        throw new Error(result.message ?? "問題の並び順更新に失敗しました。");
      }

      return result;
    },
    onMutate: (variables) => {
      setSuccessMessage(null);
      setErrorMessage(null);
      return variables.previousItems;
    },
    onError: (error, _variables, context) => {
      if (context) {
        setItems(context);
      }
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "問題の並び順更新に失敗しました。",
      );
    },
    onSuccess: async (result) => {
      const invalidateTasks = [
        queryClient.invalidateQueries({
          queryKey: unitKeys.detail(props.unitId),
        }),
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(props.materialId),
        }),
      ];

      props.questions.forEach((question) => {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: questionKeys.detail(question.id),
          }),
        );
      });

      props.chapterIds.forEach((chapterId) => {
        invalidateTasks.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(chapterId),
          }),
        );
      });

      await Promise.all(invalidateTasks);

      setErrorMessage(null);
      setSuccessMessage(result.message ?? "問題の並び順を更新しました。");
    },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (props.disabled || mutation.isPending) {
        return;
      }
      const { active, over } = event;
      if (!over || active.id === over.id) {
        return;
      }

      const currentItems = [...items];
      const oldIndex = currentItems.findIndex((item) => item.id === active.id);
      const newIndex = currentItems.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(currentItems, oldIndex, newIndex).map(
        (item, index) => ({ ...item, order: index + 1 }),
      );

      setItems(reordered);

      mutation.mutate({
        orderedItems: reordered,
        previousItems: currentItems,
      });
    },
    [items, mutation, props.disabled],
  );

  const externalDisabled = props.disabled ?? false;

  const presenterState = useMemo<QuestionReorderTablePresenterProps>(() => {
    return {
      questions: props.questions,
      items,
      isMounted,
      isPending: mutation.isPending || externalDisabled,
      successMessage,
      errorMessage,
      sensors,
      onDragEnd: handleDragEnd,
      selectable: props.selectable ?? false,
      selectedIds: props.selectedIds ?? [],
      onToggleSelect: props.onToggleSelect,
      onToggleSelectAll: props.onToggleSelectAll,
    };
  }, [
    props.questions,
    items,
    isMounted,
    mutation.isPending,
    externalDisabled,
    successMessage,
    errorMessage,
    sensors,
    handleDragEnd,
    props.selectable,
    props.selectedIds,
    props.onToggleSelect,
    props.onToggleSelectAll,
  ]);

  return presenterState;
}
