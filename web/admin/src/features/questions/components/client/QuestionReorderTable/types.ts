import type { DragEndEvent, SensorDescriptor } from "@dnd-kit/core";

export interface QuestionReorderTableItem {
  id: string;
  order: number;
  japanese: string;
  updatedAt: string;
}

export interface QuestionReorderTableProps {
  questions: QuestionReorderTableItem[];
  unitId: string;
  materialId: string;
  chapterIds: string[];
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
