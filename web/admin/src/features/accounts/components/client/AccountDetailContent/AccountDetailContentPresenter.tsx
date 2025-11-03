import Link from "next/link";
import type { AccountResponse } from "@/external/dto/account/account.query.dto";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

interface AccountDetailContentPresenterProps {
  account: AccountResponse | null;
  isLoading: boolean;
  isError: boolean;
  isSelf: boolean;
  pendingRole: boolean;
  pendingStatus: boolean;
  onChangeRole: (role: "admin" | "user") => void;
  onToggleStatus: () => void;
}

export function AccountDetailContentPresenter(
  props: AccountDetailContentPresenterProps,
) {
  const {
    account,
    isLoading,
    isError,
    isSelf,
    pendingRole,
    pendingStatus,
    onChangeRole,
    onToggleStatus,
  } = props;

  if (isLoading && !account) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        <Card className="space-y-4 border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        </Card>
      </div>
    );
  }

  if (isError || !account) {
    return (
      <div className="space-y-6">
        <Link
          href="/accounts"
          className="text-sm text-indigo-600 underline-offset-2 hover:underline"
        >
          ← アカウント一覧に戻る
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          アカウント情報の取得に失敗しました。
        </div>
      </div>
    );
  }

  const fullName =
    account.fullName || `${account.firstName} ${account.lastName}`.trim();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/accounts"
              className="text-indigo-600 underline-offset-2 hover:underline"
            >
              アカウント一覧
            </Link>
          </li>
          <li>›</li>
          <li className="font-semibold text-gray-700">{fullName}</li>
        </ol>
      </nav>

      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
        <p className="text-sm text-gray-600">{account.email}</p>
      </header>

      <Card className="space-y-4 border border-gray-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              ロール
            </dt>
            <dd className="text-sm text-gray-900">
              {account.role === "admin" ? "管理者" : "一般"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              ステータス
            </dt>
            <dd className="text-sm text-gray-900">
              {account.isActive ? "有効" : "利用停止"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              最終ログイン
            </dt>
            <dd className="text-sm text-gray-900">
              {account.lastLoginAt
                ? new Date(account.lastLoginAt).toLocaleString("ja-JP")
                : "ログイン履歴なし"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              認証プロバイダー
            </dt>
            <dd className="text-sm text-gray-900">
              Google（{account.providerAccountId}）
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              作成日時
            </dt>
            <dd className="text-sm text-gray-900">
              {new Date(account.createdAt).toLocaleString("ja-JP")}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              更新日時
            </dt>
            <dd className="text-sm text-gray-900">
              {new Date(account.updatedAt).toLocaleString("ja-JP")}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="space-y-6 border border-gray-200 bg-white p-6 shadow-sm">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">ロールの変更</h2>
          <p className="text-sm text-gray-600">
            管理者ロールを付与すると、このユーザーは管理画面へアクセスできます。
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Select
              key={account.role}
              defaultValue={account.role}
              onValueChange={(value) => onChangeRole(value as "admin" | "user")}
              disabled={isSelf || pendingRole}
            >
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="ロールを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">管理者</SelectItem>
                <SelectItem value="user">一般</SelectItem>
              </SelectContent>
            </Select>
            {isSelf ? (
              <p className="text-xs text-gray-500">
                自分自身のロールは変更できません。
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            利用可否の切り替え
          </h2>
          <p className="text-sm text-gray-600">
            利用停止にすると、直ちにサインアウトされ、再開するまでログインできません。
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant={account.isActive ? "destructive" : "default"}
              onClick={onToggleStatus}
              disabled={isSelf || pendingStatus}
            >
              {account.isActive ? "利用停止にする" : "利用を再開する"}
            </Button>
            {isSelf ? (
              <p className="text-xs text-gray-500">
                自分自身の利用停止は行えません。
              </p>
            ) : null}
          </div>
        </section>
      </Card>
    </div>
  );
}
