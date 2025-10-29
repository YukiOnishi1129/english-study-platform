import type { ChangeEvent } from "react";
import type { VocabularyCsvRow } from "@/features/materials/lib/parseVocabularyCsv";

export interface VocabularyCsvImporterProps {
  unitId: string;
  unitName: string;
  materialId: string;
  chapterId: string;
  existingQuestionCount: number;
}

export type ParseState =
  | { status: "idle"; rows: VocabularyCsvRow[]; errors: string[] }
  | { status: "parsing"; rows: VocabularyCsvRow[]; errors: string[] }
  | { status: "error"; rows: VocabularyCsvRow[]; errors: string[] }
  | { status: "success"; rows: VocabularyCsvRow[]; errors: string[] };

export type ImportStatus =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message?: string }
  | { status: "error"; message?: string };

export interface VocabularyCsvImporterPresenterProps {
  unitName: string;
  existingQuestionCount: number;
  templateHref: string;
  parseState: ParseState;
  importStatus: ImportStatus;
  paginatedRows: VocabularyCsvRow[];
  summary: {
    total: number;
    newCount: number;
    updateCount: number;
  };
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
