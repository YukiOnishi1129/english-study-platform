"use client";

import { useCallback, useEffect, useState } from "react";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";

interface UseStudyNavigatorOptions {
  currentUnitId: string;
  materialDetail: MaterialDetailDto | null;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

export interface UseStudyNavigatorResult {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expandedUnitId: string | null;
  onToggleUnit: (unitId: string) => void;
  onSelectQuestionInternal: (questionId: string) => void;
  onNavigateUnitInternal: (unitId: string, questionId?: string) => void;
  isNavigatorReady: boolean;
}

export function useStudyNavigator(
  options: UseStudyNavigatorOptions,
): UseStudyNavigatorResult {
  const { currentUnitId, materialDetail, onSelectQuestion, onNavigateUnit } =
    options;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(
    currentUnitId,
  );

  useEffect(() => {
    setExpandedUnitId(currentUnitId);
  }, [currentUnitId]);

  const handleToggleUnit = useCallback((unitId: string) => {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId));
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  const handleSelectQuestionInternal = useCallback(
    (questionId: string) => {
      onSelectQuestion(questionId);
      setIsOpen(false);
    },
    [onSelectQuestion],
  );

  const handleNavigateUnitInternal = useCallback(
    (unitId: string, questionId?: string) => {
      onNavigateUnit(unitId, questionId);
      setIsOpen(false);
    },
    [onNavigateUnit],
  );

  return {
    isOpen,
    onOpenChange: handleOpenChange,
    expandedUnitId,
    onToggleUnit: handleToggleUnit,
    onSelectQuestionInternal: handleSelectQuestionInternal,
    onNavigateUnitInternal: handleNavigateUnitInternal,
    isNavigatorReady: Boolean(materialDetail),
  };
}
