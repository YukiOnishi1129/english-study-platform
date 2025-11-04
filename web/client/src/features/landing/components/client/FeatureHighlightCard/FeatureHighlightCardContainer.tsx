import { FeatureHighlightCardPresenter } from "./FeatureHighlightCardPresenter";
import {
  type UseFeatureHighlightCardOptions,
  useFeatureHighlightCard,
} from "./useFeatureHighlightCard";

export type FeatureHighlightCardProps = UseFeatureHighlightCardOptions;

export function FeatureHighlightCardContainer(
  props: FeatureHighlightCardProps,
) {
  const state = useFeatureHighlightCard(props);
  return <FeatureHighlightCardPresenter {...state} />;
}
