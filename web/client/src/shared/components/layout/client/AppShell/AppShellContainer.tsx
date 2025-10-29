"use client";

import type { Account } from "@/features/account/types/account";

import { AppShellPresenter } from "./AppShellPresenter";
import { useAppShell } from "./useAppShell";

interface AppShellProps {
  account: Account;
  children: React.ReactNode;
}

export function AppShell({ account, children }: AppShellProps) {
  const {
    pathname,
    isMobileNavOpen,
    onMobileNavOpenChange,
    onStartStudy,
    isStartingStudy,
    displayName,
    avatarImage,
    avatarFallback,
    email,
  } = useAppShell({ account });

  return (
    <AppShellPresenter
      pathname={pathname}
      isMobileNavOpen={isMobileNavOpen}
      onMobileNavOpenChange={onMobileNavOpenChange}
      onStartStudy={onStartStudy}
      isStartingStudy={isStartingStudy}
      displayName={displayName}
      email={email}
      avatarImage={avatarImage}
      avatarFallback={avatarFallback}
    >
      {children}
    </AppShellPresenter>
  );
}
