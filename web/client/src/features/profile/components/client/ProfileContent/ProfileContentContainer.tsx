"use client";

import type { Account } from "@/features/accounts/types";
import { ProfileContentPresenter } from "./ProfileContentPresenter";
import { useProfileContent } from "./useProfileContent";

interface ProfileContentProps {
  account: Account;
}

export function ProfileContent({ account }: ProfileContentProps) {
  const state = useProfileContent({ account });

  return <ProfileContentPresenter {...state} />;
}
