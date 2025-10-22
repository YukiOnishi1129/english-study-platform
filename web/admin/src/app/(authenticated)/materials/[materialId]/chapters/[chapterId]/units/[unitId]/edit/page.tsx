import { redirect } from "next/navigation";

interface LegacyUnitEditPageProps {
  params: {
    unitId: string;
  };
}

export default function LegacyUnitEditPage(props: LegacyUnitEditPageProps) {
  redirect(`/units/${props.params.unitId}/edit`);
}
