"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { ListAccountsRequest } from "@/external/dto/account/account.query.dto";
import {
  buildAccountListSearchParams,
  mergeAccountListParams,
} from "@/features/accounts/lib/accountListParams";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

interface AccountListFiltersProps {
  filters: ListAccountsRequest;
  total: number;
  isPending?: boolean;
}

const ROLE_OPTIONS = [
  { value: "admin" as const, label: "管理者" },
  { value: "user" as const, label: "一般" },
];

const STATUS_OPTIONS = [
  { value: "active" as const, label: "有効" },
  { value: "inactive" as const, label: "利用停止" },
];

const ORDER_OPTIONS = [
  { value: "lastLoginDesc", label: "最終ログイン（新しい順）" },
  { value: "lastLoginAsc", label: "最終ログイン（古い順）" },
  { value: "createdDesc", label: "作成日（新しい順）" },
] as const;

export function AccountListFiltersPresenter(props: AccountListFiltersProps) {
  const { filters, total, isPending = false } = props;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const submitting = isPending || pending;

  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    (filters.roles && filters.roles.length > 0) ||
    (filters.statuses && filters.statuses.length > 0) ||
    (filters.orderBy && filters.orderBy !== "lastLoginDesc") ||
    (filters.page ?? 0) > 0;

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);

      const searchValue = (formData.get("search") as string | null)?.trim();
      const roleValues = formData
        .getAll("roles")
        .map((value) => String(value))
        .filter(
          (value): value is "admin" | "user" =>
            value === "admin" || value === "user",
        );
      const statusValues = formData
        .getAll("statuses")
        .map((value) => String(value))
        .filter(
          (value): value is "active" | "inactive" =>
            value === "active" || value === "inactive",
        );
      const orderByRaw = formData.get("orderBy") as string | null;

      const nextFilters = mergeAccountListParams(filters, {
        search: searchValue && searchValue.length > 0 ? searchValue : undefined,
        roles: roleValues.length > 0 ? roleValues : undefined,
        statuses: statusValues.length > 0 ? statusValues : undefined,
        orderBy: orderByRaw
          ? (orderByRaw as typeof filters.orderBy)
          : undefined,
        page: 0,
      });

      const query = buildAccountListSearchParams(nextFilters);

      startTransition(() => {
        const queryString = query.toString();
        const target = (
          queryString ? `${pathname}?${queryString}` : pathname
        ) as Route;
        router.push(target);
      });
    },
    [filters, pathname, router],
  );

  const handleReset = useCallback(() => {
    startTransition(() => {
      router.push(pathname as Route);
    });
  }, [pathname, router]);

  const activeRoles = new Set<"admin" | "user">(filters.roles ?? []);
  const activeStatuses = new Set<"active" | "inactive">(filters.statuses ?? []);
  const currentOrderBy = filters.orderBy ?? "lastLoginDesc";

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            アカウント一覧
          </h2>
          <p className="text-xs text-gray-500">
            総件数: <span className="font-medium text-gray-700">{total}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={handleReset}
            disabled={submitting || !hasActiveFilters}
          >
            フィルターをリセット
          </Button>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_160px_160px_200px_120px]"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="account-search"
            className="text-xs font-semibold text-gray-600"
          >
            キーワード（氏名・メール）
          </label>
          <Input
            id="account-search"
            name="search"
            placeholder="例: 山田 太郎 / example@example.com"
            defaultValue={filters.search ?? ""}
            disabled={submitting}
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold text-gray-600">
            ロール
          </legend>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cnToggle(activeRoles.has(option.value), submitting)}
              >
                <input
                  type="checkbox"
                  name="roles"
                  value={option.value}
                  defaultChecked={activeRoles.has(option.value)}
                  className="hidden"
                  disabled={submitting}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold text-gray-600">
            ステータス
          </legend>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={cnToggle(
                  activeStatuses.has(option.value),
                  submitting,
                )}
              >
                <input
                  type="checkbox"
                  name="statuses"
                  value={option.value}
                  defaultChecked={activeStatuses.has(option.value)}
                  className="hidden"
                  disabled={submitting}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="orderBy"
            className="text-xs font-semibold text-gray-600"
          >
            ソート順
          </label>
          <select
            id="orderBy"
            name="orderBy"
            defaultValue={currentOrderBy}
            disabled={submitting}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {ORDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end justify-end gap-2">
          <Button type="submit" disabled={submitting}>
            フィルターを適用
          </Button>
        </div>
      </form>
    </div>
  );
}

function cnToggle(isActive: boolean, disabled: boolean) {
  return cn(
    "inline-flex min-w-[3.5rem] items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold transition",
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    isActive
      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
      : "border-gray-200 bg-gray-100 text-gray-600 hover:border-gray-300",
  );
}
