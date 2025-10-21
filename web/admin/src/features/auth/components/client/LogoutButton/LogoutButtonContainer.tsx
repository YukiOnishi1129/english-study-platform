"use client";

import { LogoutButtonPresenter } from "./LogoutButtonPresenter";
import { useLogoutButton } from "./useLogoutButton";

export function LogoutButtonContainer() {
  const { handleLogout } = useLogoutButton();
  return <LogoutButtonPresenter onLogout={handleLogout} />;
}
