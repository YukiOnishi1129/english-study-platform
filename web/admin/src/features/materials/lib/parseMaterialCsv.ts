type RawCsvRow = string[];

export interface MaterialCsvRow {
  materialTitle: string;
  chapterTitle: string;
  unitTitle: string;
  questionJapanese: string;
  correctAnswers: string[];
  hint?: string;
  explanation?: string;
}

export interface MaterialCsvHierarchy {
  materialTitle: string;
  chapters: Array<{
    chapterTitle: string;
    units: Array<{
      unitTitle: string;
      questions: Array<{
        questionJapanese: string;
        correctAnswers: string[];
        hint?: string;
        explanation?: string;
      }>;
    }>;
  }>;
}

export interface ParseMaterialCsvResult {
  rows: MaterialCsvRow[];
  hierarchy: MaterialCsvHierarchy[];
  errors: string[];
}

const HEADER_MAP: Record<string, keyof MaterialCsvRow> = {
  教材名: "materialTitle",
  章名: "chapterTitle",
  UNIT名: "unitTitle",
  日本語: "questionJapanese",
  ヒント: "hint",
  解説: "explanation",
};

const REQUIRED_HEADERS = [
  "教材名",
  "章名",
  "UNIT名",
  "日本語",
  "英語正解1",
] as const;

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

function buildHierarchy(rows: MaterialCsvRow[]): MaterialCsvHierarchy[] {
  const materialsMap = new Map<string, MaterialCsvHierarchy>();

  rows.forEach((row) => {
    const material = materialsMap.get(row.materialTitle) ?? {
      materialTitle: row.materialTitle,
      chapters: [],
    };

    if (!materialsMap.has(row.materialTitle)) {
      materialsMap.set(row.materialTitle, material);
    }

    let chapter = material.chapters.find(
      (c) => c.chapterTitle === row.chapterTitle,
    );
    if (!chapter) {
      chapter = {
        chapterTitle: row.chapterTitle,
        units: [],
      };
      material.chapters.push(chapter);
    }

    let unit = chapter.units.find((u) => u.unitTitle === row.unitTitle);
    if (!unit) {
      unit = {
        unitTitle: row.unitTitle,
        questions: [],
      };
      chapter.units.push(unit);
    }

    unit.questions.push({
      questionJapanese: row.questionJapanese,
      correctAnswers: row.correctAnswers,
      hint: row.hint,
      explanation: row.explanation,
    });
  });

  return Array.from(materialsMap.values());
}

export function parseMaterialCsv(content: string): ParseMaterialCsvResult {
  const errors: string[] = [];
  if (!content.trim()) {
    return { rows: [], hierarchy: [], errors: ["CSVファイルが空です。"] };
  }

  const sanitizedContent = content.replace(/\uFEFF/g, "");
  const csvRows = parseCsvRows(sanitizedContent);

  if (csvRows.length === 0) {
    return {
      rows: [],
      hierarchy: [],
      errors: ["CSVファイルに有効な行がありません。"],
    };
  }

  const headerCells = csvRows[0]?.map((cell) => cell.trim()) ?? [];

  const headerIndexMap = new Map<keyof typeof HEADER_MAP, number>();
  const answerHeaderEntries: Array<{ index: number; order: number }> = [];
  const answerHeaderPattern = /^英語正解(\d+)$/;

  headerCells.forEach((cell, index) => {
    const normalized = cell.replace(/\s+/g, "");
    const mappedKey = HEADER_MAP[normalized as keyof typeof HEADER_MAP];
    if (mappedKey) {
      headerIndexMap.set(mappedKey, index);
      return;
    }

    if (answerHeaderPattern.test(normalized)) {
      const [, order] = normalized.match(answerHeaderPattern) ?? [];
      answerHeaderEntries.push({ index, order: Number(order) || 0 });
    }
  });

  const answerHeaderIndices = answerHeaderEntries
    .sort((a, b) => a.order - b.order)
    .map((entry) => entry.index);

  const headerSet = new Set(
    headerCells.map((cell) => cell.replace(/\s+/g, "")),
  );
  const missingHeaders = REQUIRED_HEADERS.filter(
    (headerName) => !headerSet.has(headerName),
  );
  if (missingHeaders.length > 0) {
    errors.push(`必須列が見つかりません: ${missingHeaders.join(", ")}`);
    return { rows: [], hierarchy: [], errors };
  }

  if (answerHeaderIndices.length === 0) {
    errors.push(
      "英語正解の列が見つかりません。最低でも英語正解1を含めてください。",
    );
    return { rows: [], hierarchy: [], errors };
  }

  const rows: MaterialCsvRow[] = [];

  for (let rowIndex = 1; rowIndex < csvRows.length; rowIndex += 1) {
    const cells = csvRows[rowIndex];
    const rowNumber = rowIndex + 1;

    const getCell = (header: keyof MaterialCsvRow) => {
      const index = headerIndexMap.get(header);
      return typeof index === "number" ? (cells[index]?.trim() ?? "") : "";
    };

    const materialTitle = getCell("materialTitle");
    const chapterTitle = getCell("chapterTitle");
    const unitTitle = getCell("unitTitle");
    const questionJapanese = getCell("questionJapanese");
    const answers = answerHeaderIndices
      .map((answerIndex) => cells[answerIndex]?.trim() ?? "")
      .filter((value) => value);

    if (
      !materialTitle ||
      !chapterTitle ||
      !unitTitle ||
      !questionJapanese ||
      answers.length === 0
    ) {
      errors.push(`${rowNumber}行目に必須項目の抜けがあります。`);
      continue;
    }

    const hint = getCell("hint") || undefined;
    const explanation = getCell("explanation") || undefined;

    rows.push({
      materialTitle,
      chapterTitle,
      unitTitle,
      questionJapanese,
      correctAnswers: answers,
      hint,
      explanation,
    });
  }

  return {
    rows,
    hierarchy: buildHierarchy(rows),
    errors,
  };
}
