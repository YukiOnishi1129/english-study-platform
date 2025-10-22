type RawCsvRow = string[];

export interface UnitQuestionCsvRow {
  questionId?: string;
  japanese: string;
  correctAnswers: string[];
  hint?: string;
  explanation?: string;
  order?: number;
}

export interface ParseUnitQuestionCsvResult {
  rows: UnitQuestionCsvRow[];
  errors: string[];
}

const HEADER_ALIASES: Record<string, keyof UnitQuestionCsvRow> = {
  関連ID: "questionId",
  問題ID: "questionId",
  日本語: "japanese",
  ヒント: "hint",
  解説: "explanation",
  並び順: "order",
};

const REQUIRED_HEADERS = ["日本語"] as const;

function splitCsvLine(line: string): RawCsvRow {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const next = line[index + 1];
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells;
}

function normalizeHeader(header: string): string {
  return header.replace(/\s+/g, "");
}

export function parseUnitQuestionCsv(
  content: string,
): ParseUnitQuestionCsvResult {
  const errors: string[] = [];

  if (!content.trim()) {
    return { rows: [], errors: ["CSVファイルが空です。"] };
  }

  const lines = content
    .replace(/\uFEFF/g, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { rows: [], errors: ["CSVファイルに有効な行がありません。"] };
  }

  const headerCells = splitCsvLine(lines[0]).map((cell) => cell.trim());

  const headerIndexMap = new Map<keyof UnitQuestionCsvRow, number>();
  const answerHeaderDetails: Array<{ index: number; order: number }> = [];
  const answerHeaderPattern = /^英語正解(\d+)$/;
  let singleAnswerIndex: number | null = null;

  headerCells.forEach((cell, index) => {
    const normalized = normalizeHeader(cell);
    const mappedKey = HEADER_ALIASES[normalized as keyof typeof HEADER_ALIASES];
    if (mappedKey) {
      headerIndexMap.set(mappedKey, index);
      return;
    }

    if (normalized === "英語正解") {
      singleAnswerIndex = index;
      return;
    }

    if (answerHeaderPattern.test(normalized)) {
      const [, order] = normalized.match(answerHeaderPattern) ?? [];
      answerHeaderDetails.push({
        index,
        order: Number(order) || 0,
      });
    }
  });

  const answerHeaderIndices = answerHeaderDetails
    .sort((a, b) => a.order - b.order)
    .map((detail) => detail.index);

  const headerSet = new Set(headerCells.map((cell) => normalizeHeader(cell)));
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerSet.has(header),
  );

  if (missingHeaders.length > 0) {
    errors.push(`必須列が見つかりません: ${missingHeaders.join(", ")}`);
    return { rows: [], errors };
  }

  if (answerHeaderIndices.length === 0 && singleAnswerIndex === null) {
    errors.push(
      "英語正解の列が見つかりません。英語正解1（または旧フォーマットの英語正解）を含めてください。",
    );
    return { rows: [], errors };
  }

  const rows: UnitQuestionCsvRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const rawLine = lines[lineIndex];
    const cells = splitCsvLine(rawLine);
    const rowNumber = lineIndex + 1;

    if (cells.every((cell) => cell.trim() === "")) {
      continue;
    }

    const getCell = (header: keyof UnitQuestionCsvRow) => {
      const index = headerIndexMap.get(header);
      return typeof index === "number" ? (cells[index]?.trim() ?? "") : "";
    };

    const japanese = getCell("japanese");
    if (!japanese) {
      errors.push(`行${rowNumber}: 日本語の列が空です。`);
      continue;
    }

    const questionId = getCell("questionId") || undefined;
    const hint = getCell("hint") || undefined;
    const explanation = getCell("explanation") || undefined;

    let order: number | undefined;
    const orderCell = getCell("order");
    if (orderCell) {
      const parsed = Number(orderCell);
      if (Number.isNaN(parsed)) {
        errors.push(
          `行${rowNumber}: 並び順は数値で指定してください。入力値: ${orderCell}`,
        );
        continue;
      }
      order = parsed;
    }

    const multiColumnAnswers = answerHeaderIndices
      .map((index) => cells[index]?.trim() ?? "")
      .filter((answer) => answer.length > 0);

    const combinedColumnAnswers =
      singleAnswerIndex !== null
        ? (() => {
            const raw = cells[singleAnswerIndex]?.trim() ?? "";
            if (!raw) {
              return [] as string[];
            }
            return raw
              .split(/\s*\|\|\s*/u)
              .map((answer) => answer.trim())
              .filter((answer) => answer.length > 0);
          })()
        : [];

    const mergedAnswers = [
      ...multiColumnAnswers,
      ...combinedColumnAnswers,
    ].filter((answer) => answer.length > 0);

    const uniqueAnswers: string[] = [];
    mergedAnswers.forEach((answer) => {
      if (!uniqueAnswers.includes(answer)) {
        uniqueAnswers.push(answer);
      }
    });

    if (uniqueAnswers.length === 0) {
      errors.push(
        `行${rowNumber}: 英語正解の列がすべて空です。少なくとも1つ入力してください。`,
      );
      continue;
    }

    rows.push({
      questionId,
      japanese,
      hint,
      explanation,
      order,
      correctAnswers: uniqueAnswers,
    });
  }

  return { rows, errors };
}
