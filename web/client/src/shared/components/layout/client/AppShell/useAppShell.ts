"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";

import { getNextStudyTargetAction } from "@/external/handler/study/next-study-target.query.action";
import type { Account } from "@/features/account/types/account";

export interface UseAppShellOptions {
  account: Account;
}

export interface UseAppShellResult {
  pathname: string;
  isMobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
  onStartStudy: () => void;
  isStartingStudy: boolean;
  displayName: string;
  avatarImage?: string | null;
  avatarFallback: string;
  email: string;
}

export function useAppShell({
  account,
}: UseAppShellOptions): UseAppShellResult {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const [isStartingStudy, startStudyTransition] = useTransition();

  const onMobileNavOpenChange = useCallback((open: boolean) => {
    setMobileNavOpen(open);
  }, []);

  const onStartStudy = useCallback(() => {
    setMobileNavOpen(false);
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

  const displayName = useMemo(() => {
    if (account.fullName) {
      return account.fullName;
    }
    const names = [account.lastName, account.firstName].filter(Boolean);
    if (names.length > 0) {
      return names.join(" ");
    }
    return account.email;
  }, [account]);

  const avatarFallback = useMemo(() => {
    const source = displayName.replaceAll(/[^A-Za-z0-9一-龠ぁ-んァ-ン]/g, "");
    if (!source) {
      return "ES";
    }
    return source.slice(0, 2).toUpperCase();
  }, [displayName]);

  return {
    pathname,
    isMobileNavOpen,
    onMobileNavOpenChange,
    onStartStudy,
    isStartingStudy,
    displayName,
    avatarImage: account.thumbnail ?? null,
    avatarFallback,
    email: account.email,
  } satisfies UseAppShellResult;
}
