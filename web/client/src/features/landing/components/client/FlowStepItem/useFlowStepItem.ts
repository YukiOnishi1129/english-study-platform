export interface UseFlowStepItemOptions {
  step: string;
  title: string;
  description: string;
}

export interface UseFlowStepItemResult {
  step: string;
  title: string;
  description: string;
}

export function useFlowStepItem(
  options: UseFlowStepItemOptions,
): UseFlowStepItemResult {
  return options;
}
