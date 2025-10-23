"use client";

import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { cn } from "@/shared/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

export interface DeleteConfirmDialogProps {
  trigger: ReactElement<{ disabled?: boolean }>;
  title: ReactNode;
  description: ReactNode;
  onConfirm: () => void;
  isPending?: boolean;
  errorMessage?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  confirmLabel?: string;
  confirmPendingLabel?: string;
  cancelLabel?: string;
  contentClassName?: string;
  footerClassName?: string;
}

export function DeleteConfirmDialog(props: DeleteConfirmDialogProps) {
  const {
    trigger,
    title,
    description,
    onConfirm,
    isPending = false,
    errorMessage,
    open,
    onOpenChange,
    confirmLabel = "削除する",
    confirmPendingLabel = "削除中...",
    cancelLabel = "キャンセル",
    contentClassName,
    footerClassName,
  } = props;

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const currentOpen = isControlled ? Boolean(open) : internalOpen;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const triggerElement = useMemo(() => {
    if (!isValidElement<{ disabled?: boolean }>(trigger)) {
      throw new Error("DeleteConfirmDialog trigger must be a valid element");
    }

    const triggerProps = trigger.props;
    const existingDisabled =
      typeof triggerProps?.disabled === "boolean"
        ? triggerProps.disabled
        : false;

    return cloneElement(trigger, {
      disabled: existingDisabled || isPending,
    });
  }, [trigger, isPending]);

  return (
    <AlertDialog open={currentOpen} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>{triggerElement}</AlertDialogTrigger>
      <AlertDialogContent className={cn("border-red-200", contentClassName)}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-700">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMessage ? (
          <p className="text-sm text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <AlertDialogFooter className={cn("text-sm", footerClassName)}>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              if (isPending) {
                return;
              }
              onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-500 disabled:bg-red-300"
          >
            {isPending ? confirmPendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
