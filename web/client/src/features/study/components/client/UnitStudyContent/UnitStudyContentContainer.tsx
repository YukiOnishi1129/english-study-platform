"use client";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";

import { UnitStudyContentPresenter } from "./UnitStudyContentPresenter";
import { useUnitStudyContent } from "./useUnitStudyContent";

interface UnitStudyContentProps {
  unitId: string;
  accountId: string | null;
  initialPreferredMode?: StudyMode | null;
}

export function UnitStudyContent(props: UnitStudyContentProps) {
  const state = useUnitStudyContent(props);
  return <UnitStudyContentPresenter {...state} />;
}
