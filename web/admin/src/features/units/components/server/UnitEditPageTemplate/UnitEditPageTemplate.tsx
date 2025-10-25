import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getUnitDetail } from "@/external/handler/material/material.query.server";
import { UnitEditContent } from "@/features/units/components/client/UnitEditContent";
import { unitKeys } from "@/features/units/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

export const dynamic = "force-dynamic";

interface UnitEditPageTemplateProps {
  unitId: string;
}

export async function UnitEditPageTemplate({
  unitId,
}: UnitEditPageTemplateProps) {
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: unitKeys.detail(unitId),
      queryFn: () => getUnitDetail({ unitId }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNIT_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const detail = queryClient.getQueryData(unitKeys.detail(unitId));
  if (!detail) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnitEditContent unitId={unitId} />
    </HydrationBoundary>
  );
}
