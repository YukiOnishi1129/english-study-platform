"use client";

import Link from "next/link";
import type {
  AccountResponse,
  ListAccountsRequest,
  ListAccountsResponse,
} from "@/external/dto/account/account.query.dto";
import { AccountListFilters } from "@/features/accounts/components/client/AccountListFilters";
import {
  buildAccountListSearchParams,
  mergeAccountListParams,
} from "@/features/accounts/lib/accountListParams";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/components/ui/pagination";
import { cn } from "@/shared/lib/utils";

interface AccountListPresenterProps {
  filters: ListAccountsRequest;
  data?: ListAccountsResponse;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
}

export function AccountListPresenter(props: AccountListPresenterProps) {
  const { filters, data, isLoading, isFetching, isError } = props;

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <AccountListFilters filters={filters} total={0} isPending />
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="h-10 animate-pulse rounded-md bg-gray-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError && !data) {
    return (
      <div className="space-y-6">
        <AccountListFilters filters={filters} total={0} />
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          アカウント一覧の取得に失敗しました。時間を置いて再度お試しください。
        </div>
      </div>
    );
  }

  const total = data?.total ?? 0;
  const items = data?.items ?? [];
  const page = data?.page ?? filters.page ?? 0;
  const limit = data?.limit ?? filters.limit ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      <AccountListFilters
        filters={filters}
        total={total}
        isPending={isFetching}
      />

      {isFetching ? (
        <p className="text-xs text-gray-400">最新のデータを取得しています…</p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-600">
          条件に一致するアカウントがありません。検索条件を変更して再度お試しください。
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                <th scope="col" className="px-4 py-3">
                  アカウント
                </th>
                <th scope="col" className="px-4 py-3">
                  ロール
                </th>
                <th scope="col" className="px-4 py-3">
                  ステータス
                </th>
                <th scope="col" className="px-4 py-3">
                  最終ログイン
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  詳細
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
              {items.map((account) => (
                <AccountTableRow key={account.id} account={account} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 ? (
        <AccountListPagination
          page={page}
          totalPages={totalPages}
          filters={filters}
        />
      ) : null}
    </div>
  );
}

interface AccountTableRowProps {
  account: AccountResponse;
}

function AccountTableRow({ account }: AccountTableRowProps) {
  const fullName =
    account.fullName || `${account.firstName} ${account.lastName}`.trim();
  const statusLabel = account.isActive ? "有効" : "利用停止";
  const avatarImage = account.thumbnail ?? undefined;
  const avatarFallback = (() => {
    const source = fullName || account.email;
    const normalized = source.replaceAll(/[^A-Za-z0-9一-龠ぁ-んァ-ン]/g, "");
    if (!normalized) return "AC";
    return normalized.slice(0, 2).toUpperCase();
  })();

  const statusColor = account.isActive
    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
    : "bg-red-50 text-red-700 border border-red-200";

  return (
    <tr>
      <td className="px-4 py-4 align-top">
        <div className="flex items-start gap-3">
          <Avatar className="size-10">
            {avatarImage ? (
              <AvatarImage src={avatarImage} alt={fullName || account.email} />
            ) : (
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-gray-900">{fullName}</span>
            <span className="text-xs text-gray-500">{account.email}</span>
            <span className="text-xs text-gray-400">
              登録日: {new Date(account.createdAt).toLocaleString("ja-JP")}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
            account.role === "admin"
              ? "bg-indigo-50 text-indigo-700"
              : "bg-gray-100 text-gray-700",
          )}
        >
          {account.role === "admin" ? "管理者" : "一般"}
        </span>
      </td>
      <td className="px-4 py-4 align-top">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold",
            statusColor,
          )}
        >
          {statusLabel}
        </span>
      </td>
      <td className="px-4 py-4 align-top text-sm text-gray-700">
        {account.lastLoginAt ? (
          <div className="flex flex-col gap-0.5">
            <span>{new Date(account.lastLoginAt).toLocaleString("ja-JP")}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">ログイン記録なし</span>
        )}
      </td>
      <td className="px-4 py-4 text-right align-top text-sm">
        <Link
          href={`/accounts/${account.id}`}
          className="text-indigo-600 underline-offset-4 hover:underline"
        >
          詳細を見る
        </Link>
      </td>
    </tr>
  );
}

interface AccountListPaginationProps {
  page: number;
  totalPages: number;
  filters: ListAccountsRequest;
}

function AccountListPagination(props: AccountListPaginationProps) {
  const { page, totalPages, filters } = props;
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = Math.max(page - 1, 0);
  const nextPage = Math.min(page + 1, totalPages - 1);

  const prevParams = buildAccountListSearchParams(
    mergeAccountListParams(filters, { page: prevPage }),
  );
  const nextParams = buildAccountListSearchParams(
    mergeAccountListParams(filters, { page: nextPage }),
  );

  const prevHref = prevPage === page ? undefined : buildHref(prevParams);
  const nextHref = nextPage === page ? undefined : buildHref(nextParams);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={prevHref ?? "#"}
            className={cn({ "pointer-events-none opacity-50": page === 0 })}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="text-xs text-gray-500">
            {page + 1} / {totalPages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href={nextHref ?? "#"}
            className={cn({
              "pointer-events-none opacity-50": page >= totalPages - 1,
            })}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildHref(params: URLSearchParams) {
  const query = params.toString();
  return query.length > 0 ? `/accounts?${query}` : "/accounts";
}

const SKELETON_KEYS = [
  "accounts-skeleton-1",
  "accounts-skeleton-2",
  "accounts-skeleton-3",
  "accounts-skeleton-4",
  "accounts-skeleton-5",
];
