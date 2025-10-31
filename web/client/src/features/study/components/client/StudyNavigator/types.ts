import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";

import type { UnitStudyQuestionViewModel } from "@/features/study/components/client/UnitStudyContent/useUnitStudyContent";
import type { UnitNavigatorNodeProps } from "@/features/units/components/client/UnitNavigator";

export interface StudyNavigatorProps {
  materialDetail: MaterialDetailDto | null;
  currentUnitId: string;
  currentQuestionId: string | null;
  questions: UnitStudyQuestionViewModel[];
  accountId: string | null;
  displayMode: StudyMode;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

export interface StudyNavigatorPresenterProps extends StudyNavigatorProps {
  isNavigatorReady: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expandedUnitId: string | null;
  onToggleUnit: (unitId: string) => void;
  onSelectQuestionInternal: (questionId: string) => void;
  onNavigateUnitInternal: (unitId: string, questionId?: string) => void;
}

export interface NavigatorContentProps {
  materialDetail: MaterialDetailDto | null;
  currentUnitId: string;
  currentQuestionId: string | null;
  currentUnitQuestions: UnitStudyQuestionViewModel[];
  accountId: string | null;
  expandedUnitId: string | null;
  displayMode: StudyMode;
  onToggleUnit: (unitId: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

export type { UnitNavigatorNodeProps };
