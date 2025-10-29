"use client";

import { UnitStudyContentPresenter } from "./UnitStudyContentPresenter";
import { useUnitStudyContent } from "./useUnitStudyContent";

interface UnitStudyContentProps {
  unitId: string;
  accountId: string | null;
}

export function UnitStudyContent(props: UnitStudyContentProps) {
  const state = useUnitStudyContent(props);
  return <UnitStudyContentPresenter {...state} />;
}
