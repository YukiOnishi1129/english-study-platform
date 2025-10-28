export function formatReviewAccuracy(value: number | null): string {
  if (value === null) {
    return "未解答";
  }
  return `${Math.round(value * 100)}%`;
}

export function formatReviewDate(value: Date | null): string {
  if (!value) {
    return "未解答";
  }
  try {
    const formatter = new Intl.DateTimeFormat("ja-JP", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return formatter.format(value);
  } catch (_error) {
    return value.toString();
  }
}
