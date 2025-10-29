export const reviewKeys = {
  root: () => ["review"] as const,
  list: (accountId: string | null, materialId: string | null) =>
    ["review", accountId ?? "guest", materialId ?? "all"] as const,
};
