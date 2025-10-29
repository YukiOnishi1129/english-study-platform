"use client";

import type { UnitNavigatorNodeProps } from "./types";
import { UnitNavigatorNodePresenter } from "./UnitNavigatorNodePresenter";
import { useUnitNavigatorNodeView } from "./useUnitNavigatorNode";

export function UnitNavigatorNode(props: UnitNavigatorNodeProps) {
  const view = useUnitNavigatorNodeView(props);

  return <UnitNavigatorNodePresenter {...props} view={view} />;
}
