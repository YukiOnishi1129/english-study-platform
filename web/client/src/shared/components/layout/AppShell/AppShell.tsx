"use client";

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  HelpCircle,
  LayoutDashboard,
  Menu,
  PlayCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import type { Account } from "@/features/account/types/account";
import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/lib/utils";

interface AppShellProps {
  account: Account;
  children: React.ReactNode;
}

interface NavigationItem {
  label: string;
  href?: Route;
  icon: LucideIcon;
  comingSoon?: boolean;
}

const mainNavigation: NavigationItem[] = [
  {
    label: "ダッシュボード",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "教材一覧",
    href: "/materials",
    icon: BookOpen,
  },
  {
    label: "学習する",
    icon: PlayCircle,
    comingSoon: true,
  },
  {
    label: "学習分析",
    icon: BarChart3,
    comingSoon: true,
  },
];

const secondaryNavigation: NavigationItem[] = [
  {
    label: "ヘルプセンター",
    icon: HelpCircle,
    comingSoon: true,
  },
  {
    label: "設定",
    icon: Settings,
    comingSoon: true,
  },
];

function NavigationList({
  items,
  pathname,
  closeOnSelect,
}: {
  items: NavigationItem[];
  pathname: string;
  closeOnSelect?: boolean;
}) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href !== "#" &&
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

export function AppShell({ account, children }: AppShellProps) {
  const pathname = usePathname() ?? "";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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

  const initials = useMemo(() => {
    const source = displayName.replaceAll(/[^A-Za-z0-9一-龠ぁ-んァ-ン]/g, "");
    if (!source) {
      return "ES";
    }
    return source.slice(0, 2).toUpperCase();
  }, [displayName]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-white/80 px-6 py-8 backdrop-blur-xl md:flex">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-400 text-lg font-semibold text-white shadow-lg">
              ES
            </span>
            <div>
              <p className="text-base font-semibold text-slate-900">
                English Study
              </p>
              <p className="text-xs text-slate-500">
                あなた専用の学習コンパニオン
              </p>
            </div>
          </Link>

          <nav className="mt-8 flex-1 space-y-6 overflow-y-auto">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                ナビゲーション
              </p>
              <NavigationList items={mainNavigation} pathname={pathname} />
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                サポート
              </p>
              <NavigationList items={secondaryNavigation} pathname={pathname} />
            </div>
          </nav>

          <Card className="mt-6 border-none bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-400 text-white shadow-xl">
            <CardContent className="space-y-3 px-5 py-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">今日のおすすめ</p>
                <Sparkles className="size-4 opacity-80" />
              </div>
              <p className="text-sm leading-relaxed text-indigo-50/90">
                昨日学習した「基本挨拶」の復習を始めましょう。3問だけでウォームアップ！
              </p>
              <Button
                variant="secondary"
                className="w-full justify-center bg-white/90 text-indigo-600 hover:bg-white"
              >
                復習する
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85vw] max-w-sm border-r border-border/60 bg-white/90 px-5 py-6 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-400 to-sky-400 text-lg font-semibold text-white shadow-lg">
                        ES
                      </span>
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          English Study
                        </p>
                        <p className="text-xs text-slate-500">
                          あなた専用の学習コンパニオン
                        </p>
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
                      <p className="text-xs font-semibold text-indigo-500">
                        今日のおすすめ
                      </p>
                      <p className="mt-2 text-sm text-indigo-700">
                        「基本挨拶」を3問だけ復習してウォームアップしましょう。
                      </p>
                      <SheetClose asChild>
                        <Button className="mt-4 w-full justify-center">
                          復習する
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="hidden flex-col md:flex">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                    今日も学習を継続しよう
                  </p>
                  <h1 className="text-lg font-semibold text-slate-900">
                    {displayName}さんの学習ダッシュボード
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  今日の学習をはじめる
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded-full border border-border/60 bg-white px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:border-indigo-200 hover:shadow"
                    >
                      <Avatar className="size-9">
                        {account.thumbnail ? (
                          <AvatarImage
                            src={account.thumbnail}
                            alt={displayName}
                          />
                        ) : (
                          <AvatarFallback>{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="hidden text-left sm:block">
                        <p className="text-sm font-semibold leading-tight text-slate-900">
                          {displayName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {account.email}
                        </p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900">
                          {displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {account.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled className="justify-between">
                      プロフィール
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                        Soon
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="justify-between">
                      通知設定
                      <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                        Soon
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <div className="w-full">
                        <LogoutButton
                          className="w-full justify-start"
                          variant="ghost"
                        />
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
