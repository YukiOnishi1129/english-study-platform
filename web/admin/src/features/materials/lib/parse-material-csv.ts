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

const HEADER_MAP: Record<string, keyof MaterialCsvRow | "answer2" | "answer3"> =
  {
    教材名: "materialTitle",
    章名: "chapterTitle",
    UNIT名: "unitTitle",
    日本語: "questionJapanese",
    英語正解1: "correctAnswers",
    英語正解2: "answer2",
    英語正解3: "answer3",
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

function splitCsvLine(line: string): RawCsvRow {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      const peek = line[i + 1];
      if (inQuotes && peek === '"') {
        current += '"';
        i += 1;
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

  const lines = content
    .replace(/\uFEFF/g, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      rows: [],
      hierarchy: [],
      errors: ["CSVファイルに有効な行がありません。"],
    };
  }

  const headerCells = splitCsvLine(lines[0]).map((cell) => cell.trim());

  const headerIndexMap = new Map<
    keyof typeof HEADER_MAP | "answer2" | "answer3",
    number
  >();
  headerCells.forEach((cell, index) => {
    const normalized = cell.replace(/\s+/g, "");
    if (HEADER_MAP[normalized as keyof typeof HEADER_MAP]) {
      headerIndexMap.set(
        HEADER_MAP[normalized as keyof typeof HEADER_MAP],
        index,
      );
    }
    if (normalized === "英語正解2") {
      headerIndexMap.set("answer2", index);
    }
    if (normalized === "英語正解3") {
      headerIndexMap.set("answer3", index);
    }
  });

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

  const rows: MaterialCsvRow[] = [];

  for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    const cells = splitCsvLine(line);
    if (cells.every((cell) => cell.trim() === "")) {
      continue;
    }

    const getCell = (header: keyof MaterialCsvRow | "answer2" | "answer3") => {
      const index = headerIndexMap.get(header);
      return typeof index === "number" ? (cells[index]?.trim() ?? "") : "";
    };

    const materialTitle = getCell("materialTitle");
    const chapterTitle = getCell("chapterTitle");
    const unitTitle = getCell("unitTitle");
    const questionJapanese = getCell("questionJapanese");
    const answer1 = getCell("correctAnswers");
    const answer2 = getCell("answer2");
    const answer3 = getCell("answer3");

    if (
      !materialTitle ||
      !chapterTitle ||
      !unitTitle ||
      !questionJapanese ||
      !answer1
    ) {
      errors.push(`${lineIndex + 1}行目に必須項目の抜けがあります。`);
      continue;
    }

    const hint = getCell("hint") || undefined;
    const explanation = getCell("explanation") || undefined;
    const answers = [answer1, answer2, answer3].filter((value) => value);

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
