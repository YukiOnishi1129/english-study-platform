"use client";

import { LogoutButton } from "@/features/auth/components/client/LogoutButton";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface HeaderBarProps {
  displayName: string;
  email: string;
  avatarImage?: string | null;
  avatarFallback: string;
  onStartStudy: () => void;
  isStartingStudy: boolean;
  mobileMenuTrigger: React.ReactNode;
}

export function HeaderBar({
  displayName,
  email,
  avatarImage,
  avatarFallback,
  onStartStudy,
  isStartingStudy,
  mobileMenuTrigger,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {mobileMenuTrigger}
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
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            type="button"
            onClick={onStartStudy}
            disabled={isStartingStudy}
          >
            今日の学習をはじめる
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-3 rounded-full border border-border/60 bg-white px-2.5 py-1.5 text-sm font-medium shadow-sm transition hover:border-indigo-200 hover:shadow"
              >
                <Avatar className="size-9">
                  {avatarImage ? (
                    <AvatarImage src={avatarImage} alt={displayName} />
                  ) : (
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-tight text-slate-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-slate-500">{email}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </span>
                  <span className="text-xs text-muted-foreground">{email}</span>
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
  );
}
