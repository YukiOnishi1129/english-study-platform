"use client";

import { StudyNavigatorSidebarPresenter } from "./StudyNavigatorSidebarPresenter";
import {
  type UseStudyNavigatorSidebarOptions,
  useStudyNavigatorSidebar,
} from "./useStudyNavigatorSidebar";

export interface StudyNavigatorSidebarProps
  extends UseStudyNavigatorSidebarOptions {}

export function StudyNavigatorSidebar(props: StudyNavigatorSidebarProps) {
  const state = useStudyNavigatorSidebar(props);

  return <StudyNavigatorSidebarPresenter {...state} />;
}
