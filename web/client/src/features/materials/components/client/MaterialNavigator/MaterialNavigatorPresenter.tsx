"use client";

import { BookOpenCheck, FolderGit2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { NavigatorUnitContent } from "./NavigatorUnitContent";
import type { UseMaterialNavigatorResult } from "./useMaterialNavigator";

type MaterialNavigatorPresenterProps = UseMaterialNavigatorResult;

export function MaterialNavigatorPresenter({
  chapters,
  hasChapters,
}: MaterialNavigatorPresenterProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderGit2 className="size-4" /> 章と問題をみる
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-lg">
        <SheetHeader className="p-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <BookOpenCheck className="size-5 text-indigo-500" />
            学習マップ
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            気になる章やUNITを選んで、好きな順番で学習できます。
          </p>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {!hasChapters ? (
            <p className="mt-4 text-sm text-muted-foreground">
              この教材にはまだ章が登録されていません。
            </p>
          ) : (
            <div className="space-y-5">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-indigo-800">
                        {chapter.name}
                      </h3>
                      {chapter.description ? (
                        <p className="mt-1 text-xs text-indigo-700/70">
                          {chapter.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-indigo-500">
                      UNIT {chapter.units.length}
                    </span>
                  </div>
                  <Separator className="my-3" />
                  <ul className="space-y-2">
                    {chapter.units.length === 0 ? (
                      <li className="rounded-xl bg-white/70 px-3 py-2 text-xs text-muted-foreground">
                        この章のUNITは準備中です。
                      </li>
                    ) : (
                      chapter.units.map((unit) => (
                        <li key={unit.id}>
                          {unit.isPlayable && unit.href ? (
                            <Link
                              href={unit.href}
                              className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm transition hover:shadow-md"
                            >
                              <NavigatorUnitContent unit={unit} />
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between rounded-xl bg-white/70 px-3 py-2 text-sm opacity-60">
                              <NavigatorUnitContent unit={unit} />
                            </div>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
