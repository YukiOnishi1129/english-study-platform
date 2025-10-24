"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DragEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { moveItem } from "@/features/chapters/lib/move-item";
import { chapterKeys } from "@/features/chapters/queries/keys";
import { materialKeys } from "@/features/materials/queries/keys";
import type { FormState } from "@/features/materials/types/formState";
import { reorderUnitsAction } from "./actions";
import type {
  ChapterUnitListPresenterProps,
  ChapterUnitListProps,
  UnitItem,
} from "./types";

export function useChapterUnitList(
  props: ChapterUnitListProps,
): ChapterUnitListPresenterProps {
  const { materialId, chapterId, units, invalidateChapterId } = props;
  const queryClient = useQueryClient();

  const sortedInput = useMemo(
    () => [...units].sort((a, b) => a.order - b.order),
    [units],
  );

  const [items, setItems] = useState<UnitItem[]>(sortedInput);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setItems(sortedInput);
  }, [sortedInput]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const mutation = useMutation<
    FormState,
    Error,
    { orderedUnitIds: string[]; materialId: string; chapterId: string },
    UnitItem[]
  >({
    mutationFn: async (payload) => {
      const result = await reorderUnitsAction({
        materialId: payload.materialId,
        chapterId: payload.chapterId,
        orderedUnitIds: payload.orderedUnitIds,
      });

      if (result.status === "error") {
        throw new Error(result.message ?? "並び順の更新に失敗しました。");
      }

      return result;
    },
    onSuccess: async () => {
      const invalidateTargets = [
        queryClient.invalidateQueries({
          queryKey: materialKeys.detail(materialId),
        }),
        queryClient.invalidateQueries({
          queryKey: chapterKeys.detail(chapterId),
        }),
      ];

      if (invalidateChapterId) {
        invalidateTargets.push(
          queryClient.invalidateQueries({
            queryKey: chapterKeys.detail(invalidateChapterId),
          }),
        );
      }

      await Promise.all(invalidateTargets);
      setErrorMessage(null);
      setSuccessMessage("並び順を更新しました。");
    },
    onError: (error, _variables, previousItems) => {
      if (previousItems) {
        setItems(previousItems);
      }
      setErrorMessage(error instanceof Error ? error.message : null);
    },
    onMutate: async (_variables) => {
      const previousItems = items;
      setIsSaving(true);
      setSuccessMessage(null);
      setErrorMessage(null);
      return previousItems;
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const commitReorder = (targetIndex: number) => {
    if (!draggingId) {
      return;
    }

    const updated = moveItem(items, draggingId, targetIndex);

    if (updated === items) {
      setDraggingId(null);
      setHoverId(null);
      return;
    }

    setItems(updated);

    mutation.mutate({
      materialId,
      chapterId,
      orderedUnitIds: updated.map((item) => item.id),
    });

    setDraggingId(null);
    setHoverId(null);
  };

  const handleDragStart = (event: DragEvent<HTMLLIElement>, unitId: string) => {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);
    setDraggingId(unitId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", unitId);
  };

  const handleDragOver = (
    event: DragEvent<HTMLLIElement | HTMLUListElement>,
    unitId: string | null,
  ) => {
    event.preventDefault();
    if (isDisabled) {
      return;
    }
    event.dataTransfer.dropEffect = "move";
    setHoverId(unitId);
  };

  const handleDragLeave = (event: DragEvent<HTMLLIElement>, unitId: string) => {
    event.preventDefault();
    if (hoverId === unitId) {
      setHoverId(null);
    }
  };

  const handleItemDrop = (
    event: DragEvent<HTMLLIElement>,
    targetIndex: number,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (isDisabled) {
      return;
    }
    commitReorder(targetIndex);
  };

  const handleListDrop = (event: DragEvent<HTMLUListElement>) => {
    event.preventDefault();
    if (isDisabled) {
      return;
    }
    commitReorder(items.length - 1);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setHoverId(null);
  };

  const isDisabled = items.length <= 1 || isSaving || mutation.isPending;

  return {
    items,
    isSaving: isSaving || mutation.isPending,
    successMessage,
    errorMessage,
    draggingId,
    hoverId,
    isDisabled,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onItemDrop: handleItemDrop,
    onListDrop: handleListDrop,
    onDragEnd: handleDragEnd,
  } satisfies ChapterUnitListPresenterProps;
}
