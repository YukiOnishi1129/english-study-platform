"use client";

import type { FormState } from "@/features/materials/types/formState";
import { useUnitDetailQuery } from "@/features/units/queries/useUnitDetailQuery";
import { UnitEditContentPresenter } from "./UnitEditContentPresenter";

interface UnitEditContentProps {
  unitId: string;
  onSubmit: (state: FormState, formData: FormData) => Promise<FormState>;
}

export function UnitEditContent(props: UnitEditContentProps) {
  const { unitId, onSubmit } = props;
  const { data, isLoading, isError } = useUnitDetailQuery(unitId);

  return (
    <UnitEditContentPresenter
      detail={data}
      isLoading={isLoading}
      isError={isError}
      onSubmit={onSubmit}
    />
  );
}
