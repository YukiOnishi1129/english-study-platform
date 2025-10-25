"use client";

import { DashboardContentPresenter } from "./DashboardContentPresenter";
import { useDashboardContent } from "./useDashboardContent";

interface DashboardContentProps {
  accountId: string;
  displayName: string;
}

export function DashboardContent(props: DashboardContentProps) {
  const { accountId, displayName } = props;
  const viewModel = useDashboardContent({ accountId, displayName });

  return <DashboardContentPresenter {...viewModel} />;
}
