"use client";

import type { VocabularyCsvImporterProps } from "./types";
import { useVocabularyCsvImporter } from "./useVocabularyCsvImporter";
import { VocabularyCsvImporterPresenter } from "./VocabularyCsvImporterPresenter";

export function VocabularyCsvImporter(props: VocabularyCsvImporterProps) {
  const state = useVocabularyCsvImporter(props);
  return <VocabularyCsvImporterPresenter {...state} />;
}
