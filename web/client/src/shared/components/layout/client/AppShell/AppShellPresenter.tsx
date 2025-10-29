"use client";

import { Menu } from "lucide-react";

import type { ReactNode } from "react";
import { HeaderBar } from "@/shared/components/layout/client/HeaderBar";
import { MobileNavigationSheetContent } from "@/shared/components/layout/client/MobileNavigationSheetContent";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";

interface AppShellPresenterProps {
  children: ReactNode;
  pathname: string;
  isMobileNavOpen: boolean;
  onMobileNavOpenChange: (open: boolean) => void;
  onStartStudy: () => void;
  isStartingStudy: boolean;
  displayName: string;
  email: string;
  avatarImage?: string | null;
  avatarFallback: string;
}

export function AppShellPresenter({
  children,
  pathname,
  isMobileNavOpen,
  onMobileNavOpenChange,
  onStartStudy,
  isStartingStudy,
  displayName,
  email,
  avatarImage,
  avatarFallback,
}: AppShellPresenterProps) {
  const mobileTrigger = (
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Open navigation">
        <Menu className="size-5" />
      </Button>
    </SheetTrigger>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="flex min-h-screen">
        <div className="flex flex-1 flex-col">
          <Sheet open={isMobileNavOpen} onOpenChange={onMobileNavOpenChange}>
            <HeaderBar
              displayName={displayName}
              email={email}
              avatarImage={avatarImage}
              avatarFallback={avatarFallback}
              onStartStudy={onStartStudy}
              isStartingStudy={isStartingStudy}
              mobileMenuTrigger={mobileTrigger}
            />
            <MobileNavigationSheetContent pathname={pathname} />
          </Sheet>
          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
