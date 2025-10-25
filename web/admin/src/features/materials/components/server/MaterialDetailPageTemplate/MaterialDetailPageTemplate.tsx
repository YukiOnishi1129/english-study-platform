import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getMaterialHierarchyById } from "@/external/handler/material/material.query.server";
import { MaterialDetailContent } from "@/features/materials/components/client/MaterialDetailContent";
import { materialKeys } from "@/features/materials/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

interface MaterialDetailPageTemplateProps {
  materialId: string;
}

export async function MaterialDetailPageTemplate({
  materialId,
}: MaterialDetailPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: materialKeys.detail(materialId),
      queryFn: async () => {
        const response = await getMaterialHierarchyById({ materialId });
        if (!response) {
          throw new Error("MATERIAL_NOT_FOUND");
        }
        return response;
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "MATERIAL_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const detail = queryClient.getQueryData(materialKeys.detail(materialId));
  if (!detail) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MaterialDetailContent materialId={materialId} />
    </HydrationBoundary>
  );
}
