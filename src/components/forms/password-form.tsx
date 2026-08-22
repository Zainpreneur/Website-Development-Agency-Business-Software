"use client";

import { useActionState, useRef } from "react";
import { TriangleAlert } from "lucide-react";

import { changePassword } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await changePassword(prev, formData);
    if (!result.error) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="currentPassword" required>
          Current password
        </Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
        <FieldError message={state.fieldErrors?.currentPassword} />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="newPassword" required>
          New password
        </Label>
        <Input id="newPassword" name="newPassword" type="password" required />
        <FieldError message={state.fieldErrors?.newPassword} />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="confirmPassword" required>
          Confirm new password
        </Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
        <FieldError message={state.fieldErrors?.confirmPassword} />
      </FieldGroup>

      <SubmitButton>Update password</SubmitButton>
    </form>
  );
}
