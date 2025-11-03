"use client";

import { useMemo } from "react";
import type { Account } from "@/features/accounts/types";

interface UseProfileContentOptions {
  account: Account;
}

export interface ProfileContentState {
  accountId: string;
  displayName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roleLabel: string;
  isActive: boolean;
  statusLabel: string;
  avatarImage: string | null;
  avatarFallback: string;
  providerLabel: string;
  providerAccountId: string;
  createdAtText: string;
  lastLoginText: string;
}

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

function computeDisplayName(account: Account): string {
  if (account.fullName && account.fullName.trim().length > 0) {
    return account.fullName;
  }
  const joined = [account.firstName, account.lastName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value && value.length > 0))
    .join(" ");
  return joined.length > 0 ? joined : account.email;
}

function buildAvatarFallback(source: string): string {
  const normalized = source.replaceAll(/[^A-Za-z0-9一-龠ぁ-んァ-ン]/g, "");
  if (!normalized) {
    return "AC";
  }
  return normalized.slice(0, 2).toUpperCase();
}

function formatDate(value: Date | string | null | undefined): string {
  if (!value) {
    return "未ログイン";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未ログイン";
  }
  return dateFormatter.format(date);
}

export function useProfileContent({
  account,
}: UseProfileContentOptions): ProfileContentState {
  const displayName = useMemo(() => computeDisplayName(account), [account]);

  const avatarFallback = useMemo(
    () => buildAvatarFallback(displayName || account.email),
    [account.email, displayName],
  );

  const providerLabel = useMemo(() => {
    switch (account.provider) {
      case "google":
        return "Google";
      default:
        return account.provider;
    }
  }, [account.provider]);

  const roleLabel = account.role === "admin" ? "管理者" : "一般ユーザー";
  const statusLabel = account.isActive ? "有効" : "利用停止中";

  const createdAtText = useMemo(
    () => formatDate(account.createdAt),
    [account.createdAt],
  );
  const lastLoginText = useMemo(
    () => formatDate(account.lastLoginAt),
    [account.lastLoginAt],
  );

  return {
    accountId: account.id,
    displayName,
    email: account.email,
    firstName: account.firstName,
    lastName: account.lastName,
    fullName: account.fullName,
    roleLabel,
    isActive: account.isActive,
    statusLabel,
    avatarImage: account.thumbnail ?? null,
    avatarFallback,
    providerLabel,
    providerAccountId: account.providerAccountId,
    createdAtText,
    lastLoginText,
  };
}
