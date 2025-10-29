"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

import type { UseUnitDetailContentResult } from "../useUnitDetailContent";

interface UnitHeaderCardProps {
  unit: NonNullable<UseUnitDetailContentResult["unit"]>;
}

export function UnitHeaderCard({ unit }: UnitHeaderCardProps) {
  const studyHref: `/units/${string}/study` = `/units/${unit.id}/study`;

  return (
    <Card className="border border-indigo-100/70 bg-white/95">
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl font-bold text-slate-900">
            {unit.name}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            {unit.description ??
              "素早く繰り返し学習して、表現を定着させましょう。"}
          </CardDescription>
        </div>
        <Button asChild size="lg">
          <Link href={studyHref}>このUNITで学習を開始</Link>
        </Button>
      </CardHeader>
    </Card>
  );
}
