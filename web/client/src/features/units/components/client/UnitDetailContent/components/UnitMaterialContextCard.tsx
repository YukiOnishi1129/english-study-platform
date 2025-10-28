"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { UseUnitDetailContentResult } from "../useUnitDetailContent";

interface UnitMaterialContextCardProps {
  material: NonNullable<UseUnitDetailContentResult["material"]>;
}

export function UnitMaterialContextCard({
  material,
}: UnitMaterialContextCardProps) {
  return (
    <Card className="border border-indigo-100/70">
      <CardHeader>
        <CardTitle className="text-base">教材情報</CardTitle>
        <CardDescription>
          このUNITは「{material.name}」に含まれています
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        <p>
          教材の説明: {material.description ?? "説明はまだ登録されていません。"}
        </p>
      </CardContent>
    </Card>
  );
}
