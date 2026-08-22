"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { updateProfile } from "@/lib/actions/settings";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

const initialState: ActionState = {};

export function ProfileForm({ name, title }: { name: string; title: string | null }) {
  const [state, formAction] = useActionState(updateProfile, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="name" required>
          Name
        </Label>
        <Input id="name" name="name" defaultValue={name} required />
        <FieldError message={state.fieldErrors?.name} />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={title ?? ""} placeholder="e.g. Lead Developer" />
      </FieldGroup>

      <SubmitButton>Save profile</SubmitButton>
    </form>
  );
}
