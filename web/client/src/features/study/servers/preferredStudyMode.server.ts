"use server";

import "server-only";

import { cookies } from "next/headers";
import type { StudyMode } from "@/external/dto/study/submit-unit-answer.dto";
import { StudyModeSchema } from "@/external/dto/study/submit-unit-answer.dto";

const GLOBAL_PREFERRED_MODE_KEY = "unit-study-mode";
const DAYS_30_IN_SECONDS = 60 * 60 * 24 * 30;

export async function getPreferredStudyModeServer(
  unitId: string,
): Promise<StudyMode | null> {
  const store = await cookies();
  const candidates = [
    store.get(`unit-study-mode-${unitId}`)?.value ?? null,
    store.get(GLOBAL_PREFERRED_MODE_KEY)?.value ?? null,
  ];

  for (const value of candidates) {
    if (!value) {
      continue;
    }
    const parsed = StudyModeSchema.safeParse(value);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return null;
}

export async function setPreferredStudyModeServer(options: {
  unitId: string;
  mode: StudyMode;
}): Promise<void> {
  const { unitId, mode } = options;
  const store = await cookies();
  const expires = new Date(Date.now() + DAYS_30_IN_SECONDS * 1000);

  store.set({
    name: `unit-study-mode-${unitId}`,
    value: mode,
    path: "/",
    maxAge: DAYS_30_IN_SECONDS,
    expires,
    sameSite: "lax",
  });
  store.set({
    name: GLOBAL_PREFERRED_MODE_KEY,
    value: mode,
    path: "/",
    maxAge: DAYS_30_IN_SECONDS,
    expires,
    sameSite: "lax",
  });
}
