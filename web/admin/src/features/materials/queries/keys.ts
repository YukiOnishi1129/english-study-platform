export const materialKeys = {
  all: [{ scope: "materials" }] as const,
  list: () => [...materialKeys.all, { entity: "list" }] as const,
  detail: (materialId: string) =>
    [...materialKeys.all, { entity: "detail", materialId }] as const,
  unitDetail: (unitId: string) =>
    [...materialKeys.all, { entity: "unitDetail", unitId }] as const,
};
