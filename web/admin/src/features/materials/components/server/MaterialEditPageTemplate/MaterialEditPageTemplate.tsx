import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getMaterialHierarchyAction } from "@/external/handler/material/material.query.action";
import { MaterialEditContent } from "@/features/materials/components/client/MaterialEditContent";
import { materialKeys } from "@/features/materials/queries/keys";
import { ensureMaterialHierarchy } from "@/features/materials/queries/validation";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

interface MaterialEditPageTemplateProps {
  materialId: string;
}

export async function MaterialEditPageTemplate({
  materialId,
}: MaterialEditPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: materialKeys.detail(materialId),
      queryFn: async () => {
        const response = await getMaterialHierarchyAction({ materialId });
        if (!response) {
          throw new Error("MATERIAL_NOT_FOUND");
        }
        return ensureMaterialHierarchy(response);
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
      <MaterialEditContent materialId={materialId} />
    </HydrationBoundary>
  );
}
