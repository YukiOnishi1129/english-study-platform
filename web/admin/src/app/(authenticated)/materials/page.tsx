import { MaterialListPageTemplate } from "@/features/materials/components/server";

export default async function MaterialsPage(_: PageProps<"/materials">) {
  return <MaterialListPageTemplate />;
}
