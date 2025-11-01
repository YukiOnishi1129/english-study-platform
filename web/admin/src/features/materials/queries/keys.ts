export const materialKeys = {
  all: [{ scope: "materials" }] as const,
  list: () => [...materialKeys.all, { entity: "list" }] as const,
  detail: (materialId: string) =>
    [...materialKeys.all, { entity: "detail", materialId }] as const,
  contentTypes: () =>
    [...materialKeys.all, { entity: "content-types" }] as const,
};
