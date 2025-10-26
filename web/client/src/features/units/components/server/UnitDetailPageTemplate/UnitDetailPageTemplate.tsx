import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getUnitDetail } from "@/external/handler/unit/unit.query.server";
import { UnitDetailContent } from "@/features/units/components/client/UnitDetailContent";
import { unitKeys } from "@/features/units/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

interface UnitDetailPageTemplateProps {
  unitId: string;
}

export async function UnitDetailPageTemplate({
  unitId,
}: UnitDetailPageTemplateProps) {
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

  const cached = queryClient.getQueryData(unitKeys.detail(unitId));
  if (!cached) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnitDetailContent unitId={unitId} />
    </HydrationBoundary>
  );
}
