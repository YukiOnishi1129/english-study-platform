import { LoginButtonContainer } from "@/features/auth/components/client/LoginButton";

export function LoginPageTemplate() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">English Study Platform</h1>
          <p className="mt-2 text-gray-600">Sign in to continue</p>
        </div>
        <LoginButtonContainer />
      </div>
    </div>
  );
}
