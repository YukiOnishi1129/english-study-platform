export const materialKeys = {
  list: (accountId: string | null) =>
    ["materials", accountId ?? "anon"] as const,
  detail: (materialId: string, accountId: string | null) =>
    ["material", materialId, accountId ?? "anon"] as const,
};
