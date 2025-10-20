"use client";

import { LoginButtonPresenter } from "./LoginButtonPresenter";
import { useLoginButton } from "./useLoginButton";

export function LoginButtonContainer() {
  const { handleGoogleLogin } = useLoginButton();

  return <LoginButtonPresenter onGoogleLogin={handleGoogleLogin} />;
}
