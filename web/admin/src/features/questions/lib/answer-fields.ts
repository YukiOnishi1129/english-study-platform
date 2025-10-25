export interface AnswerField {
  id: string;
  value: string;
}

export function createAnswerField(value = ""): AnswerField {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, value };
}

export function toAnswerFields(values: readonly string[]): AnswerField[] {
  const entries = values.length > 0 ? values : [""];
  return entries.map((entry) => createAnswerField(entry));
}
