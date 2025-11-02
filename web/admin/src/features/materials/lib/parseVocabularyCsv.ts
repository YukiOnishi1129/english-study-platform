type RawCsvRow = string[];

export interface VocabularyCsvRow {
  vocabularyId?: string;
  questionId?: string;
  order?: number;
  headword: string;
  pronunciation?: string;
  partOfSpeech?: string;
  definitionJa: string;
  definitionVariants: string[];
  prompt?: string;
  annotation?: string;
  answerCandidates: string[];
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  exampleSentenceEn?: string;
  exampleSentenceJa?: string;
}

export interface ParseVocabularyCsvResult {
  rows: VocabularyCsvRow[];
  errors: string[];
}

const HEADER_ALIASES: Record<string, keyof VocabularyCsvRow> = {
  語彙ID: "vocabularyId",
  単語ID: "vocabularyId",
  関連ID: "questionId",
  問題ID: "questionId",
  並び順: "order",
  英単語: "headword",
  発音: "pronunciation",
  品詞: "partOfSpeech",
  プロンプト: "prompt",
  注釈: "annotation",
  "例文(英)": "exampleSentenceEn",
  "例文(和)": "exampleSentenceJa",
};

const REQUIRED_HEADERS = ["英単語", "日本語訳1", "正解候補1"] as const;

const ANSWER_PREFIX = /^正解候補(\d+)$/;
const DEFINITION_PREFIX = /^日本語訳(\d+)$/;
const SYNONYM_PREFIX = /^類義語(\d+)$/;
const ANTONYM_PREFIX = /^対義語(\d+)$/;
const RELATED_PREFIX = /^関連語(\d+)$/;

function parseCsvRows(content: string): RawCsvRow[] {
  const rows: RawCsvRow[] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];

    if (char === '"') {
      const next = content[index + 1];
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";

      if (char === "\r" && content[index + 1] === "\n") {
        index += 1;
      }

      rows.push(currentRow);
      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  rows.push(currentRow);

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function normalizeHeader(header: string): string {
  return header.replace(/\s+/g, "");
}

function splitMultiValue(cell: string): string[] {
  const trimmed = cell.trim();
  return trimmed.length > 0 ? [trimmed] : [];
}

export function parseVocabularyCsv(content: string): ParseVocabularyCsvResult {
  const errors: string[] = [];

  if (!content.trim()) {
    return { rows: [], errors: ["CSVファイルが空です。"] };
  }

  const sanitizedContent = content.replace(/\uFEFF/g, "");
  const csvRows = parseCsvRows(sanitizedContent);
  if (csvRows.length === 0) {
    return { rows: [], errors: ["CSVファイルに有効な行がありません。"] };
  }

  const headerCells = csvRows[0]?.map((cell) => cell.trim()) ?? [];
  const headerIndexMap = new Map<keyof VocabularyCsvRow, number>();

  const answerColumnIndices: number[] = [];
  const definitionColumnIndices: Array<{ index: number; order: number }> = [];
  const synonymIndices: Array<{ index: number; order: number }> = [];
  const antonymIndices: Array<{ index: number; order: number }> = [];
  const relatedIndices: Array<{ index: number; order: number }> = [];
  let fallbackDefinitionIndex: number | null = null;
  let fallbackAnswerIndex: number | null = null;

  headerCells.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    const alias = HEADER_ALIASES[normalized as keyof typeof HEADER_ALIASES];
    if (alias) {
      headerIndexMap.set(alias, index);
      return;
    }

    if (normalized === "日本語訳") {
      fallbackDefinitionIndex = index;
      return;
    }

    if (normalized === "正解候補") {
      fallbackAnswerIndex = index;
      return;
    }

    const definitionMatch = normalized.match(DEFINITION_PREFIX);
    if (definitionMatch) {
      definitionColumnIndices.push({
        index,
        order: Number(definitionMatch[1]) || 0,
      });
      return;
    }

    const answerMatch = normalized.match(ANSWER_PREFIX);
    if (answerMatch) {
      answerColumnIndices.push(index);
      return;
    }

    const synonymMatch = normalized.match(SYNONYM_PREFIX);
    if (synonymMatch) {
      synonymIndices.push({
        index,
        order: Number(synonymMatch[1]) || 0,
      });
      return;
    }

    const antonymMatch = normalized.match(ANTONYM_PREFIX);
    if (antonymMatch) {
      antonymIndices.push({
        index,
        order: Number(antonymMatch[1]) || 0,
      });
      return;
    }

    const relatedMatch = normalized.match(RELATED_PREFIX);
    if (relatedMatch) {
      relatedIndices.push({
        index,
        order: Number(relatedMatch[1]) || 0,
      });
    }
  });

  const headerSet = new Set(headerCells.map((cell) => normalizeHeader(cell)));
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerSet.has(header),
  );
  if (missingHeaders.length > 0) {
    errors.push(`必須列が見つかりません: ${missingHeaders.join(", ")}`);
    return { rows: [], errors };
  }

  if (answerColumnIndices.length === 0 && fallbackAnswerIndex === null) {
    errors.push("正解候補の列が見つかりません。正解候補1を含めてください。");
    return { rows: [], errors };
  }

  if (
    definitionColumnIndices.length === 0 &&
    fallbackDefinitionIndex === null
  ) {
    errors.push("日本語訳1の列が見つかりません。");
    return { rows: [], errors };
  }

  definitionColumnIndices.sort((a, b) => a.order - b.order);
  synonymIndices.sort((a, b) => a.order - b.order);
  antonymIndices.sort((a, b) => a.order - b.order);
  relatedIndices.sort((a, b) => a.order - b.order);

  const rows: VocabularyCsvRow[] = [];

  for (let rowIndex = 1; rowIndex < csvRows.length; rowIndex += 1) {
    const cells = csvRows[rowIndex];
    const rowNumber = rowIndex + 1;

    const getCell = (key: keyof VocabularyCsvRow): string => {
      const index = headerIndexMap.get(key);
      if (typeof index === "number") {
        return cells[index]?.trim() ?? "";
      }
      return "";
    };

    const vocabularyId = getCell("vocabularyId") || undefined;
    const questionId = getCell("questionId") || undefined;

    let order: number | undefined;
    const rawOrder = getCell("order");
    if (rawOrder) {
      const parsed = Number(rawOrder);
      if (Number.isNaN(parsed)) {
        errors.push(`行${rowNumber}: 並び順は数値で指定してください。`);
        continue;
      }
      order = parsed;
    }

    const headword = getCell("headword");
    if (!headword) {
      errors.push(`行${rowNumber}: 英単語が空です。`);
      continue;
    }

    const definitionCells: string[] = [];

    if (fallbackDefinitionIndex !== null) {
      const value = cells[fallbackDefinitionIndex]?.trim() ?? "";
      if (value) {
        definitionCells.push(value);
      }
    }

    definitionColumnIndices.forEach(({ index }) => {
      const value = cells[index]?.trim() ?? "";
      if (value) {
        definitionCells.push(value);
      }
    });

    const uniqueDefinitionCells = Array.from(
      new Set(definitionCells.filter((value) => value.length > 0)),
    );

    if (uniqueDefinitionCells.length === 0) {
      errors.push(`行${rowNumber}: 日本語訳が空です。`);
      continue;
    }

    const answerCells: string[] = [];
    if (fallbackAnswerIndex !== null) {
      answerCells.push(
        ...splitMultiValue(cells[fallbackAnswerIndex]?.trim() ?? ""),
      );
    }
    answerColumnIndices.forEach((index) => {
      const value = cells[index]?.trim() ?? "";
      if (value) {
        answerCells.push(value);
      }
    });

    const answerCandidates = answerCells
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (answerCandidates.length === 0) {
      errors.push(`行${rowNumber}: 正解候補が空です。`);
      continue;
    }

    const synonyms = Array.from(
      new Set(
        synonymIndices
          .map(({ index }) => cells[index]?.trim() ?? "")
          .flatMap(splitMultiValue)
          .filter((value) => value.length > 0),
      ),
    );
    const antonyms = Array.from(
      new Set(
        antonymIndices
          .map(({ index }) => cells[index]?.trim() ?? "")
          .flatMap(splitMultiValue)
          .filter((value) => value.length > 0),
      ),
    );
    const relatedWords = Array.from(
      new Set(
        relatedIndices
          .map(({ index }) => cells[index]?.trim() ?? "")
          .flatMap(splitMultiValue)
          .filter((value) => value.length > 0),
      ),
    );

    const rowData: VocabularyCsvRow = {
      vocabularyId,
      questionId,
      order,
      headword,
      pronunciation: getCell("pronunciation") || undefined,
      partOfSpeech: getCell("partOfSpeech") || undefined,
      definitionJa: uniqueDefinitionCells[0],
      definitionVariants: uniqueDefinitionCells.slice(1),
      prompt: getCell("prompt") || undefined,
      annotation: headerIndexMap.has("annotation")
        ? getCell("annotation")
        : undefined,
      answerCandidates,
      synonyms,
      antonyms,
      relatedWords,
      exampleSentenceEn: getCell("exampleSentenceEn") || undefined,
      exampleSentenceJa: getCell("exampleSentenceJa") || undefined,
    };

    rows.push(rowData);
  }

  return { rows, errors };
}
