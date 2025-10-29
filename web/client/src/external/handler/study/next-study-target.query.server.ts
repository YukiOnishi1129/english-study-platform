"use server";

import "server-only";

import type { NextStudyTargetDto } from "@/external/dto/study/next-study-target.dto";
import { StudyService } from "@/external/service/study/study.service";
import { getAuthenticatedAccount } from "@/features/auth/servers/auth-check.server";

export async function getNextStudyTarget(): Promise<NextStudyTargetDto | null> {
  const account = await getAuthenticatedAccount();
  if (!account) {
    return null;
  }

  const studyService = new StudyService();
  return studyService.getNextStudyTarget(account.id);
}
