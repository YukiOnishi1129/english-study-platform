import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import type { UnitDetailQuestionDto } from "@/external/dto/unit/unit.query.dto";

import type { UnitStudyQuestionViewModel } from "../UnitStudyContent/useUnitStudyContent";

export interface StudyNavigatorProps {
  materialDetail: MaterialDetailDto | null;
  currentUnitId: string;
  currentQuestionId: string | null;
  questions: UnitStudyQuestionViewModel[];
  accountId: string | null;
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
  onToggleUnit: (unitId: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

export interface UnitNavigatorNodeProps {
  unit: MaterialDetailDto["chapters"][number]["units"][number];
  accountId: string | null;
  isCurrentUnit: boolean;
  isExpanded: boolean;
  currentQuestionId: string | null;
  currentUnitQuestions: UnitStudyQuestionViewModel[];
  onToggle: () => void;
  onSelectQuestion: (questionId: string) => void;
  onNavigateUnit: (unitId: string, questionId?: string) => void;
}

export interface NavigatorQuestion {
  id: string;
  label: string;
  japanese: string;
  order: number;
}

export type NavigatorQuestionSource = UnitDetailQuestionDto;
