import type { DragEndEvent, SensorDescriptor } from "@dnd-kit/core";

export interface QuestionReorderTableItem {
  id: string;
  order: number;
  japanese: string;
  updatedAt: string;
}

export interface QuestionReorderServerActionArgs {
  unitId: string;
  materialId: string;
  chapterIds: string[];
}

export interface QuestionReorderTableProps {
  questions: QuestionReorderTableItem[];
  serverActionArgs: QuestionReorderServerActionArgs;
  reorderUnitQuestionsAction: (data: {
    unitId: string;
    materialId: string;
    chapterIds: string[];
    orderedQuestionIds: string[];
  }) => Promise<{ success: boolean; message?: string }>;
}

export interface QuestionReorderTablePresenterProps {
  questions: QuestionReorderTableItem[];
  items: QuestionReorderTableItem[];
  isMounted: boolean;
  isPending: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  sensors: Array<SensorDescriptor<Record<string, unknown>>>;
  onDragEnd: (event: DragEndEvent) => void;
}
