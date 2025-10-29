import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { useMaterialDetailQuery } from "@/features/materials/queries";

export interface UseMaterialDetailPageParams {
  materialId: string;
  accountId: string | null;
}

export interface UseMaterialDetailPageResult {
  material: MaterialDetailDto["material"] | null;
  chapters: MaterialDetailDto["chapters"];
  isLoading: boolean;
  isError: boolean;
}

export function useMaterialDetailPage({
  materialId,
  accountId,
}: UseMaterialDetailPageParams): UseMaterialDetailPageResult {
  const { data, isLoading, isError } = useMaterialDetailQuery(
    materialId,
    accountId,
  );

  return {
    material: data?.material ?? null,
    chapters: data?.chapters ?? [],
    isLoading,
    isError,
  };
}
