"use client";

import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";

interface LoadingSkeletonProps {
  message?: string;
}

export function LoadingSkeleton({ message }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-64 animate-pulse rounded-md bg-slate-200" />
        <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <Card key={key} className="border-dashed border-indigo-100/70">
            <CardHeader className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
            </CardHeader>
            <CardContent>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-dashed border-indigo-100/70">
          <CardContent className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </Card>
        <Card className="border-dashed border-indigo-100/70">
          <CardContent className="h-64 animate-pulse rounded-xl bg-slate-100" />
        </Card>
      </div>
      {message ? (
        <p className="text-sm text-muted-foreground">{message}</p>
      ) : null}
    </div>
  );
}
