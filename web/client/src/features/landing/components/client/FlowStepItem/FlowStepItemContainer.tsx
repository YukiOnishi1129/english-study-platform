import { FlowStepItemPresenter } from "./FlowStepItemPresenter";
import {
  type UseFlowStepItemOptions,
  useFlowStepItem,
} from "./useFlowStepItem";

export type FlowStepItemProps = UseFlowStepItemOptions;

export function FlowStepItemContainer(props: FlowStepItemProps) {
  const state = useFlowStepItem(props);
  return <FlowStepItemPresenter {...state} />;
}
