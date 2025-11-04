export interface UseFeatureHighlightCardOptions {
  icon: string;
  title: string;
  description: string;
}

export interface UseFeatureHighlightCardResult {
  icon: string;
  title: string;
  description: string;
}

export function useFeatureHighlightCard(
  options: UseFeatureHighlightCardOptions,
): UseFeatureHighlightCardResult {
  return options;
}
