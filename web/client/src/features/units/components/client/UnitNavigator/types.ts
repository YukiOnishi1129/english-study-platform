import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import type { UnitDetailQuestionDto } from "@/external/dto/unit/unit.query.dto";

import type { UnitStudyQuestionViewModel } from "@/features/study/components/client/UnitStudyContent/useUnitStudyContent";

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
  statistics: UnitStudyQuestionViewModel["statistics"] | null;
  order: number;
}

export type NavigatorQuestionSource = UnitDetailQuestionDto;
