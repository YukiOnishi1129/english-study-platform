import { LoginButton } from "@/features/auth/components/client/LoginButton";

export function LoginPageTemplate() {
  return (
    <div className="space-y-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          English Study Platform Admin
        </h1>
        <p className="mt-2 text-gray-600">Googleアカウントでサインイン</p>
      </div>
      <LoginButton />
    </div>
  );
}
