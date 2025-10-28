"use client";

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

export function MaterialDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-4 w-24" />
      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader className="space-y-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
      <Card className="border border-indigo-100/70 bg-white/95">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32" />
        </CardContent>
      </Card>
    </div>
  );
}
