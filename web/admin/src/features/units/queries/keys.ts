export const unitKeys = {
  all: [{ scope: "units" }] as const,
  detail: (unitId: string) =>
    [...unitKeys.all, { entity: "detail", unitId }] as const,
};
