import { LoginButton } from "@/features/auth/components/client/LoginButton";

export function LoginPageTemplate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            English Study Platform Admin
          </h1>
          <p className="mt-2 text-gray-600">Googleアカウントでサインイン</p>
        </div>
        <LoginButton />
      </div>
    </div>
  );
}
