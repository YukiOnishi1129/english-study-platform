import type { ReactNode } from "react";

interface GuestLayoutWrapperProps {
  children: ReactNode;
}

export function GuestLayoutWrapper({ children }: GuestLayoutWrapperProps) {
  return <>{children}</>;
}
