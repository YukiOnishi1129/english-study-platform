import { redirect } from "next/navigation";

interface LegacyUnitDetailPageProps {
  params: {
    unitId: string;
  };
}

export default function LegacyUnitDetailPage(props: LegacyUnitDetailPageProps) {
  redirect(`/units/${props.params.unitId}`);
}
