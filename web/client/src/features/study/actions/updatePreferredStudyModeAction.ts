"use server";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";
import { setPreferredStudyModeServer } from "@/features/study/servers/preferredStudyMode.server";

interface UpdatePreferredStudyModeParams {
  unitId: string;
  mode: StudyMode;
}

export async function updatePreferredStudyModeAction(
  params: UpdatePreferredStudyModeParams,
): Promise<void> {
  await setPreferredStudyModeServer(params);
}
