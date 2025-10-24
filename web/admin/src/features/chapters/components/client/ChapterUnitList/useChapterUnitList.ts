"use client";

import type { DragEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { moveItem } from "@/features/chapters/lib/move-item";
import type { ReorderUnitsActionPayload } from "@/features/materials/types/reorderUnitsAction";
import type {
  ChapterUnitListPresenterProps,
  ChapterUnitListProps,
  UnitItem,
} from "./types";

export function useChapterUnitList(
  props: ChapterUnitListProps,
): ChapterUnitListPresenterProps {
  const { materialId, chapterId, units, onReorder } = props;

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

  const handleReorder = async (
    payload: ReorderUnitsActionPayload,
    previousItems: UnitItem[],
  ) => {
    setIsSaving(true);
    try {
      const result = await onReorder(payload);
      if (result.status === "error") {
        setErrorMessage(result.message ?? "並び順の更新に失敗しました。");
        setItems(previousItems);
      } else {
        setErrorMessage(null);
        setSuccessMessage(result.message ?? "並び順を更新しました。");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "並び順の更新に失敗しました。",
      );
      setItems(previousItems);
    } finally {
      setIsSaving(false);
    }
  };

  const commitReorder = (targetIndex: number) => {
    if (!draggingId) {
      return;
    }

    const previousItems = items;
    const updated = moveItem(items, draggingId, targetIndex);

    if (updated === items) {
      setDraggingId(null);
      setHoverId(null);
      return;
    }

    setItems(updated);

    const payload: ReorderUnitsActionPayload = {
      materialId,
      chapterId,
      orderedUnitIds: updated.map((item) => item.id),
    };

    void handleReorder(payload, previousItems);

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

  const isDisabled = items.length <= 1 || isSaving;

  return {
    items,
    isSaving,
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
