export const unitKeys = {
  detail: (unitId: string, accountId: string | null) =>
    ["unit", unitId, accountId ?? "anon"] as const,
};
