import type { MaterialListItemDto } from "@/external/dto/material/material.list.dto";
import { useMaterialListQuery } from "@/features/materials/queries";

export interface UseMaterialListPageResult {
  materials: MaterialListItemDto[];
  isLoading: boolean;
  isError: boolean;
}

export function useMaterialListPage(
  accountId: string | null,
): UseMaterialListPageResult {
  const { data, isLoading, isError } = useMaterialListQuery(accountId);

  return {
    materials: data ?? [],
    isLoading,
    isError,
  };
}
