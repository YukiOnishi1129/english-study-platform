"use client";

import type { ComponentProps } from "react";
import { LogoutButtonPresenter } from "./LogoutButtonPresenter";
import { useLogoutButton } from "./useLogoutButton";

type LogoutButtonContainerProps = Pick<
  ComponentProps<typeof LogoutButtonPresenter>,
  "className" | "variant"
>;

export function LogoutButtonContainer(props: LogoutButtonContainerProps) {
  const { handleLogout } = useLogoutButton();

  return <LogoutButtonPresenter onLogout={handleLogout} {...props} />;
}
