import type { DragEvent } from "react";

export interface UnitItem {
  id: string;
  name: string;
  description: string | null;
  order: number;
  questionCount: number;
}

export interface ChapterUnitListProps {
  materialId: string;
  chapterId: string;
  units: UnitItem[];
  invalidateChapterId?: string;
}

export interface ChapterUnitListPresenterProps {
  items: UnitItem[];
  isSaving: boolean;
  successMessage: string | null;
  errorMessage: string | null;
  draggingId: string | null;
  hoverId: string | null;
  isDisabled: boolean;
  onDragStart: (event: DragEvent<HTMLLIElement>, unitId: string) => void;
  onDragOver: (
    event: DragEvent<HTMLLIElement | HTMLUListElement>,
    unitId: string | null,
  ) => void;
  onDragLeave: (event: DragEvent<HTMLLIElement>, unitId: string) => void;
  onItemDrop: (event: DragEvent<HTMLLIElement>, targetIndex: number) => void;
  onListDrop: (event: DragEvent<HTMLUListElement>) => void;
  onDragEnd: () => void;
}
