import { AdminDashboardPageTemplate } from "@/features/dashboard/components/server";

export default async function DashboardPage(_: PageProps<"/">) {
  return <AdminDashboardPageTemplate />;
}
