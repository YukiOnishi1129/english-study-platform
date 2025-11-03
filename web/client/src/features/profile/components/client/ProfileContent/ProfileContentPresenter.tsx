"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import type { ProfileContentState } from "./useProfileContent";

export function ProfileContentPresenter(props: ProfileContentState) {
  const {
    displayName,
    email,
    avatarImage,
    avatarFallback,
    roleLabel,
    statusLabel,
    isActive,
    firstName,
    lastName,
    fullName,
    providerLabel,
    providerAccountId,
    createdAtText,
    lastLoginText,
    accountId,
  } = props;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="size-20 border border-slate-200 shadow-sm">
            {avatarImage ? (
              <AvatarImage src={avatarImage} alt={displayName} />
            ) : (
              <AvatarFallback className="text-lg font-semibold text-slate-600">
                {avatarFallback}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">
                プロフィール
              </p>
              <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                {displayName}
              </h1>
              <p className="text-sm text-slate-600">{email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{roleLabel}</Badge>
              <Badge variant={isActive ? "outline" : "destructive"}>
                {statusLabel}
              </Badge>
              <Badge variant="outline">連携元: {providerLabel}</Badge>
            </div>
          </div>
        </div>
        <Separator className="my-6" />
        <p className="text-sm leading-relaxed text-slate-600">
          Google
          アカウントと同期された基本情報です。今後、表示名やアイコンを変更できる編集機能を追加予定です。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>
              連携アカウントから取得したプロフィールを表示しています。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  表示名
                </dt>
                <dd className="text-base text-slate-900">{displayName}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  メールアドレス
                </dt>
                <dd className="text-base text-slate-900">{email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  名
                </dt>
                <dd className="text-base text-slate-900">{firstName || "—"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  姓
                </dt>
                <dd className="text-base text-slate-900">{lastName || "—"}</dd>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  フルネーム
                </dt>
                <dd className="text-base text-slate-900">{fullName || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>アカウント情報</CardTitle>
            <CardDescription>
              同期元や利用状況などのメタデータです。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-5">
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  アカウント ID
                </dt>
                <dd className="break-words text-sm text-slate-900">
                  {accountId}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  連携元
                </dt>
                <dd className="text-sm text-slate-900">
                  {providerLabel}
                  <span className="ml-2 text-xs text-slate-500">
                    ({providerAccountId})
                  </span>
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  利用状況
                </dt>
                <dd className="text-sm text-slate-900">{statusLabel}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  最終ログイン
                </dt>
                <dd className="text-sm text-slate-900">{lastLoginText}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  登録日
                </dt>
                <dd className="text-sm text-slate-900">{createdAtText}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
