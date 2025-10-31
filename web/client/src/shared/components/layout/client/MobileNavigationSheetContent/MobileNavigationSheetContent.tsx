"use client";

import Link from "next/link";
import {
  mainNavigation,
  secondaryNavigation,
} from "@/shared/components/layout/client/AppShell/navigation";
import { NavigationList } from "@/shared/components/layout/client/NavigationList";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";

interface MobileNavigationSheetContentProps {
  pathname: string;
  onStartStudy: () => void;
  isStartingStudy: boolean;
}

export function MobileNavigationSheetContent({
  pathname,
  onStartStudy,
  isStartingStudy,
}: MobileNavigationSheetContentProps) {
  return (
    <SheetContent
      side="left"
      className="w-[85vw] max-w-sm border-r border-border/60 bg-white/90 px-5 py-6 backdrop-blur-xl"
    >
      <SheetHeader className="sr-only">
        <SheetTitle>ナビゲーションメニュー</SheetTitle>
      </SheetHeader>
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-400 text-lg font-semibold text-white shadow-lg">
          ES
        </span>
        <div>
          <p className="text-base font-semibold text-slate-900">
            English Study
          </p>
          <p className="text-xs text-slate-500">あなた専用の学習コンパニオン</p>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            ナビゲーション
          </p>
          <NavigationList
            items={mainNavigation}
            pathname={pathname}
            closeOnSelect
            onAction={(action) => {
              if (action === "startStudy") {
                onStartStudy();
              }
            }}
            disabledActions={isStartingStudy ? ["startStudy"] : undefined}
          />
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            サポート
          </p>
          <NavigationList
            items={secondaryNavigation}
            pathname={pathname}
            closeOnSelect
          />
        </div>
      </div>
      <Separator className="my-6" />
      <div className="rounded-2xl bg-indigo-50/70 px-4 py-4">
        <p className="text-xs font-semibold text-indigo-500">今日のおすすめ</p>
        <p className="mt-2 text-sm text-indigo-700">
          「基本挨拶」を3問だけ復習してウォームアップしましょう。
        </p>
        <SheetClose asChild>
          <Button asChild className="mt-4 w-full justify-center" type="button">
            <Link href="/review">復習する</Link>
          </Button>
        </SheetClose>
      </div>
    </SheetContent>
  );
}
