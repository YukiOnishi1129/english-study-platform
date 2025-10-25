import { AuthRedirectPageTemplate } from "@/features/auth/components/server/AuthRedirectPageTemplate";

export default async function Home(_: PageProps<"/">) {
  return <AuthRedirectPageTemplate />;
}
