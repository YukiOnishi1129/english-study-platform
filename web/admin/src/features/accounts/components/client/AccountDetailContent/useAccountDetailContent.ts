"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTransition } from "react";
import { toast } from "sonner";
import type { AccountResponse } from "@/external/dto/account/account.query.dto";
import {
  updateAccountRoleAction,
  updateAccountStatusAction,
} from "@/external/handler/account/account.command.action";
import { useAccountDetailQuery } from "@/features/accounts/queries";
import { accountKeys } from "@/features/accounts/queries/keys";

interface UseAccountDetailContentParams {
  accountId: string;
  currentAdminId: string;
}

interface UseAccountDetailContentResult {
  account: AccountResponse | null;
  isLoading: boolean;
  isError: boolean;
  isSelf: boolean;
  pendingRole: boolean;
  pendingStatus: boolean;
  onChangeRole: (role: "admin" | "user") => void;
  onToggleStatus: () => void;
}

export function useAccountDetailContent(
  params: UseAccountDetailContentParams,
): UseAccountDetailContentResult {
  const { accountId, currentAdminId } = params;
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useAccountDetailQuery(accountId);
  const [pendingRole, startRoleTransition] = useTransition();
  const [pendingStatus, startStatusTransition] = useTransition();

  const account = (data ?? null) as AccountResponse | null;
  const isSelf = account ? account.id === currentAdminId : false;

  const invalidateAccountQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: accountKeys.detail(accountId),
      }),
      queryClient.invalidateQueries({ queryKey: accountKeys.all }),
    ]);
  };

  const onChangeRole = (nextRole: "admin" | "user") => {
    if (!account || nextRole === account.role || isSelf) {
      return;
    }

    startRoleTransition(async () => {
      try {
        await updateAccountRoleAction({
          targetAccountId: account.id,
          operatorAccountId: currentAdminId,
          nextRole,
        });

        await invalidateAccountQueries();
        toast.success(
          `ロールを${nextRole === "admin" ? "管理者" : "一般"}に変更しました。`,
        );
      } catch (error) {
        console.error(error);
        toast.error("ロールの変更に失敗しました。");
      }
    });
  };

  const onToggleStatus = () => {
    if (!account || isSelf) {
      return;
    }

    const nextStatus = !account.isActive;
    startStatusTransition(async () => {
      try {
        await updateAccountStatusAction({
          targetAccountId: account.id,
          operatorAccountId: currentAdminId,
          isActive: nextStatus,
        });

        await invalidateAccountQueries();
        toast.success(
          nextStatus
            ? "アカウントを有効にしました。"
            : "アカウントを利用停止にしました。",
        );
      } catch (error) {
        console.error(error);
        toast.error("利用可否の更新に失敗しました。");
      }
    });
  };

  return {
    account,
    isLoading,
    isError,
    isSelf,
    pendingRole,
    pendingStatus,
    onChangeRole,
    onToggleStatus,
  };
}
