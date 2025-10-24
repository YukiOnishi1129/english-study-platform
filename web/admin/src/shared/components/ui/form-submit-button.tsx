"use client";

import type { VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button, type buttonVariants } from "@/shared/components/ui/button";

interface FormSubmitButtonProps {
  pendingLabel?: string;
  children: ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

export function FormSubmitButton(props: FormSubmitButtonProps) {
  const status = useFormStatus();
  const {
    pendingLabel = "送信中...",
    children,
    className,
    variant,
    size,
  } = props;

  return (
    <Button
      type="submit"
      disabled={status.pending}
      className={className}
      variant={variant}
      size={size}
    >
      {status.pending ? pendingLabel : children}
    </Button>
  );
}
