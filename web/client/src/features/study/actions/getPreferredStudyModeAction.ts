"use server";

import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";
import { getPreferredStudyModeServer } from "@/features/study/servers/preferredStudyMode.server";

export async function getPreferredStudyModeAction(
  unitId: string,
): Promise<StudyMode | null> {
  return getPreferredStudyModeServer(unitId);
}
