"use client";

import Link from "next/link";
import type { NavigationItem } from "@/shared/components/layout/client/AppShell/navigation";
import { SheetClose } from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

interface NavigationListProps {
  items: NavigationItem[];
  pathname: string;
  closeOnSelect?: boolean;
}

export function NavigationList({
  items,
  pathname,
  closeOnSelect,
}: NavigationListProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href !== "#" &&
          item.href !== undefined &&
          (pathname === item.href || pathname.startsWith(`${item.href}/`));

        const content = (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow"
                : "text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600",
              item.comingSoon &&
                !isActive &&
                "cursor-default text-muted-foreground/70 hover:bg-transparent hover:text-muted-foreground/70",
            )}
          >
            <Icon className={cn("size-4", isActive && "text-white")} />
            <span>{item.label}</span>
            {item.comingSoon ? (
              <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                Soon
              </span>
            ) : null}
          </div>
        );

        if (!item.href || item.comingSoon) {
          return (
            <div key={item.label} className="px-1">
              {content}
            </div>
          );
        }

        const link = (
          <Link href={item.href} className="block">
            {content}
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
