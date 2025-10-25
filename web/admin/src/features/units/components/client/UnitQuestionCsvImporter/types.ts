import type { ChangeEvent } from "react";
import type { UnitQuestionCsvRow } from "@/features/materials/lib/parseUnitQuestionCsv";

export interface UnitQuestionCsvImporterProps {
  materialId: string;
  chapterId: string;
  unitId: string;
  unitName: string;
  existingQuestionCount: number;
}

export interface ParseState {
  status: "idle" | "parsing" | "success" | "error";
  rows: UnitQuestionCsvRow[];
  errors: string[];
}

export interface ImportStatus {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

export interface UnitQuestionCsvImporterPresenterProps {
  unitName: string;
  existingQuestionCount: number;
  templateHref: string;
  parseState: ParseState;
  importStatus: ImportStatus;
  paginatedRows: UnitQuestionCsvRow[];
  summary: { total: number; newCount: number; updateCount: number };
  page: number;
  totalPages: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
  canImport: boolean;
  isImporting: boolean;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}
