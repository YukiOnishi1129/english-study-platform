"use client";

import Link from "next/link";

import type { MaterialDetailDto } from "@/external/dto/material/material.detail.dto";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface MaterialSummaryCardProps {
  material: MaterialDetailDto["material"];
}

export function MaterialSummaryCard({ material }: MaterialSummaryCardProps) {
  const startHref = material.nextUnitId
    ? (`/units/${material.nextUnitId}/study` as const)
    : null;

  return (
    <Card className="border border-indigo-100/70 bg-white/95 shadow-sm">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <CardTitle className="text-3xl font-bold text-slate-900">
            {material.name}
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {material.description ?? "説明が登録されていません。"}
          </CardDescription>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="secondary">
            <Link href="/materials">ほかの教材を見る</Link>
          </Button>
          <Button asChild disabled={!startHref}>
            {startHref ? (
              <Link href={startHref}>この教材の問題を解く</Link>
            ) : (
              <span>問題を準備中</span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <SummaryItem label="UNIT数" value={material.totalUnits} />
        <SummaryItem label="問題数" value={material.totalQuestions} />
        <SummaryItem
          label="最終更新日"
          value={new Date(material.updatedAt).toLocaleDateString()}
        />
      </CardContent>
    </Card>
  );
}

interface SummaryItemProps {
  label: string;
  value: string | number;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-2xl bg-indigo-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
