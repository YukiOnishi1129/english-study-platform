import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";
import { StudyModeSchema } from "@/external/dto/study/submit-unit-answer.dto";
import type { UnitDetailDto } from "@/external/dto/unit/unit.query.dto";
import { getMaterialDetail } from "@/external/handler/material/material.query.server";
import { getUnitDetail } from "@/external/handler/unit/unit.query.server";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";
import { materialKeys } from "@/features/materials/queries";
import { UnitStudyContent } from "@/features/study/components/client/UnitStudyContent";
import { unitKeys } from "@/features/units/queries/keys";
import { getQueryClient } from "@/shared/lib/query-client";

const GLOBAL_PREFERRED_MODE_KEY = "unit-study-mode";

interface UnitStudyPageTemplateProps {
  unitId: string;
}

export async function UnitStudyPageTemplate({
  unitId,
}: UnitStudyPageTemplateProps) {
  const account = await getAuthenticatedAccount();
  const queryClient = getQueryClient();

  try {
    await queryClient.prefetchQuery({
      queryKey: unitKeys.detail(unitId, account?.id ?? null),
      queryFn: () => getUnitDetail({ unitId, accountId: account?.id }),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNIT_NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const cached = queryClient.getQueryData<UnitDetailDto | undefined>(
    unitKeys.detail(unitId, account?.id ?? null),
  );
  if (!cached) {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: materialKeys.detail(cached.material.id, account?.id ?? null),
    queryFn: () =>
      getMaterialDetail({
        materialId: cached.material.id,
        accountId: account?.id ?? null,
      }),
  });

  const cookieStore = cookies();
  const storageKey = `unit-study-mode-${unitId}`;
  const candidateValues = [
    cookieStore.get(storageKey)?.value ?? null,
    cookieStore.get(GLOBAL_PREFERRED_MODE_KEY)?.value ?? null,
  ];

  let initialPreferredMode: StudyMode | null = null;
  for (const value of candidateValues) {
    if (!value) {
      continue;
    }
    const parsed = StudyModeSchema.safeParse(value);
    if (parsed.success) {
      initialPreferredMode = parsed.data;
      break;
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnitStudyContent
        unitId={unitId}
        accountId={account?.id ?? null}
        initialPreferredMode={initialPreferredMode}
      />
    </HydrationBoundary>
  );
}
const _GLOBAL_PREFERRED_MODE_KEY = "unit-study-mode";
