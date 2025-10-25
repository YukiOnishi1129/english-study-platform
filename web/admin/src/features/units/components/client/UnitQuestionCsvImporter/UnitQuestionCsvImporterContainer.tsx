"use client";

import type { UnitQuestionCsvImporterProps } from "./types";
import { UnitQuestionCsvImporterPresenter } from "./UnitQuestionCsvImporterPresenter";
import { useUnitQuestionCsvImporter } from "./useUnitQuestionCsvImporter";

export function UnitQuestionCsvImporter(props: UnitQuestionCsvImporterProps) {
  const state = useUnitQuestionCsvImporter(props);
  return <UnitQuestionCsvImporterPresenter {...state} />;
}
