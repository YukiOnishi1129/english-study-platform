import { DashboardPageTemplate } from "@/features/dashboard/components/server";

export default async function DashboardPage(_: PageProps<"/dashboard">) {
  return <DashboardPageTemplate />;
}
