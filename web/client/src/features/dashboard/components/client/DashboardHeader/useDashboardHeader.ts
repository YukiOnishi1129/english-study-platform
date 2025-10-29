"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { getNextStudyTargetAction } from "@/external/handler/study/next-study-target.query.action";

interface UseDashboardHeaderResult {
  onStartStudy: () => void;
  isStartingStudy: boolean;
}

export function useDashboardHeader(): UseDashboardHeaderResult {
  const router = useRouter();
  const [isStartingStudy, startStudyTransition] = useTransition();

  const onStartStudy = useCallback(() => {
    startStudyTransition(() => {
      void (async () => {
        try {
          const target = await getNextStudyTargetAction();
          if (target) {
            const search = target.questionId
              ? `?questionId=${target.questionId}`
              : "";
            router.push(`/units/${target.unitId}/study${search}` as Route);
          } else {
            router.push("/materials");
          }
        } catch (_error) {
          router.push("/materials");
        }
      })();
    });
  }, [router]);

  return {
    onStartStudy,
    isStartingStudy,
  };
}
