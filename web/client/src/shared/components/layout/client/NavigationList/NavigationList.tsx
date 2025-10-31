"use client";

import Link from "next/link";
import type {
  NavigationAction,
  NavigationItem,
} from "@/shared/components/layout/client/AppShell/navigation";
import { SheetClose } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

interface NavigationListProps {
  items: NavigationItem[];
  pathname: string;
  closeOnSelect?: boolean;
  onAction?: (action: NavigationAction) => void;
  disabledActions?: NavigationAction[];
}

export function NavigationList({
  items,
  pathname,
  closeOnSelect,
  onAction,
  disabledActions,
}: NavigationListProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href !== "#" &&
          item.href !== undefined &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`));

        const isAction = Boolean(item.action);
        const isActionDisabled =
          isAction &&
          (item.comingSoon ||
            (disabledActions?.includes(item.action as NavigationAction) ??
              false));

        const content = (
          <>
            <Icon className={cn("size-4", isActive && "text-white")} />
            <span>{item.label}</span>
            {item.comingSoon ? (
              <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                Soon
              </span>
            ) : null}
          </>
        );

        if (item.comingSoon) {
          return (
            <div key={item.label} className="px-1">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/70">
                {content}
              </div>
            </div>
          );
        }

        if (isAction && item.action) {
          const button = (
            <button
              type="button"
              onClick={() => {
                if (!isActionDisabled) {
                  const action = item.action;
                  if (action) {
                    onAction?.(action);
                  }
                }
              }}
              disabled={isActionDisabled}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition cursor-pointer",
                "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:text-muted-foreground/60 disabled:hover:bg-transparent disabled:hover:text-muted-foreground/60",
              )}
            >
              {content}
            </button>
          );

          return (
            <div key={item.label} className="px-1">
              {closeOnSelect ? (
                <SheetClose asChild>{button}</SheetClose>
              ) : (
                button
              )}
            </div>
          );
        }

        if (!item.href) {
          return (
            <div key={item.label} className="px-1">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/70">
                {content}
              </div>
            </div>
          );
        }

        const link = (
          <Link href={item.href} className="block">
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow"
                  : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600",
              )}
            >
              {content}
            </div>
          </Link>
        );

        if (closeOnSelect) {
          return (
            <SheetClose asChild key={item.label}>
              {link}
            </SheetClose>
          );
        }

        return (
          <Link key={item.label} href={item.href} className="block">
            {content}
          </Link>
        );
      })}
    </div>
  );
}
