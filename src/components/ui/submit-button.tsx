"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}

export function ConfirmSubmitButton({
  confirmMessage,
  children,
  ...props
}: ButtonProps & { confirmMessage: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      loading={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
