import { LoginPageTemplate } from "@/features/auth/components/server/LoginPageTemplate";

export default async function LoginPage(_: PageProps<"/login">) {
  return <LoginPageTemplate />;
}
