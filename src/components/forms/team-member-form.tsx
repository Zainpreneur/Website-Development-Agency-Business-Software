"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { createTeamMember, updateTeamMember } from "@/lib/actions/team";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { ROLE_LABEL } from "@/lib/constants";

const initialState: ActionState = {};

interface MemberFormValues {
  id: string;
  name: string;
  email: string;
  title: string | null;
  role: string;
}

export function TeamMemberForm({ member, onSuccess }: { member?: MemberFormValues; onSuccess?: () => void }) {
  const action = member ? updateTeamMember.bind(null, member.id) : createTeamMember;
  const [state, formAction] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (!result.error) onSuccess?.();
    return result;
  }, initialState);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="name" required>
            Name
          </Label>
          <Input id="name" name="name" defaultValue={member?.name} required />
          <FieldError message={state.fieldErrors?.name} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input id="email" name="email" type="email" defaultValue={member?.email} required />
          <FieldError message={state.fieldErrors?.email} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={member?.title ?? ""} placeholder="e.g. Frontend Developer" />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="role" required>
            Role
          </Label>
          <Select id="role" name="role" defaultValue={member?.role ?? "MEMBER"} required>
            {Object.entries(ROLE_LABEL).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup className="sm:col-span-2">
          <Label htmlFor="password" required={!member}>
            {member ? "New password (optional)" : "Password"}
          </Label>
          <Input id="password" name="password" type="password" placeholder={member ? "Leave blank to keep current password" : "Minimum 8 characters"} />
          <FieldError message={state.fieldErrors?.password} />
        </FieldGroup>
      </div>

      <SubmitButton className="w-full justify-center">{member ? "Save changes" : "Add team member"}</SubmitButton>
    </form>
  );
}
