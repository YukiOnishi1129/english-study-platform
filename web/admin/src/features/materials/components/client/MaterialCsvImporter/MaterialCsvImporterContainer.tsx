"use client";

import { MaterialCsvImporterPresenter } from "./MaterialCsvImporterPresenter";
import { useMaterialCsvImporter } from "./useMaterialCsvImporter";

export function MaterialCsvImporter() {
  const props = useMaterialCsvImporter();
  return <MaterialCsvImporterPresenter {...props} />;
}
