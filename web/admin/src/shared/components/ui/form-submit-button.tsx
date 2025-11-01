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
  isPending?: boolean;
  disabled?: boolean;
}

export function FormSubmitButton(props: FormSubmitButtonProps) {
  const status = useFormStatus();
  const {
    pendingLabel = "送信中...",
    children,
    className,
    variant,
    size,
    isPending,
    disabled,
  } = props;

  const pending = isPending ?? status.pending;

  return (
    <Button
      type="submit"
      disabled={pending || disabled}
      className={className}
      variant={variant}
      size={size}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
