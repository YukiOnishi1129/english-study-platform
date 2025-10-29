"use client";

import type { VocabularyCsvImporterProps } from "./types";
import { VocabularyCsvImporterPresenter } from "./VocabularyCsvImporterPresenter";
import { useVocabularyCsvImporter } from "./useVocabularyCsvImporter";

export function VocabularyCsvImporter(props: VocabularyCsvImporterProps) {
  const state = useVocabularyCsvImporter(props);
  return <VocabularyCsvImporterPresenter {...state} />;
}

