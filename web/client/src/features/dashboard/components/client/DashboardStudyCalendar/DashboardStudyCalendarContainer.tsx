"use client";

import type { DashboardCalendarViewModel } from "../DashboardContent/useDashboardContent";
import { DashboardStudyCalendarPresenter } from "./DashboardStudyCalendarPresenter";
import { useDashboardStudyCalendar } from "./useDashboardStudyCalendar";

export interface DashboardStudyCalendarProps {
  calendar: DashboardCalendarViewModel;
}

export function DashboardStudyCalendar({
  calendar,
}: DashboardStudyCalendarProps) {
  const presenter = useDashboardStudyCalendar(calendar);

  return <DashboardStudyCalendarPresenter presenter={presenter} />;
}
