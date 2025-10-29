"use client";

import { Library } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import { NavigatorContent } from "../StudyNavigator/NavigatorContent";
import type { NavigatorContentProps } from "../StudyNavigator/types";

interface StudyNavigatorSidebarPresenterProps {
  maxHeight: string;
  navigatorProps: NavigatorContentProps;
}

export function StudyNavigatorSidebarPresenter({
  maxHeight,
  navigatorProps,
}: StudyNavigatorSidebarPresenterProps) {
  return (
    <Card
      className="flex h-full flex-col border border-indigo-100 bg-white/95 shadow-sm"
      style={{ maxHeight }}
    >
      <CardHeader className="flex flex-row items-center gap-2 border-b border-indigo-50 pb-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <Library className="size-4" />
        </div>
        <CardTitle className="text-base font-semibold text-slate-900">
          学習マップ
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0" style={{ maxHeight }}>
        <ScrollArea className="h-full">
          <div className="p-3">
            <NavigatorContent {...navigatorProps} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
