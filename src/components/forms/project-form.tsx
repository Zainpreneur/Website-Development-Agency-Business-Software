"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { createProject, updateProject } from "@/lib/actions/projects";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Textarea, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { LinkButton } from "@/components/ui/button";
import { PROJECT_STATUS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";

const initialState: ActionState = {};

interface ProjectFormValues {
  id: string;
  name: string;
  description: string | null;
  clientId: string;
  status: string;
  budget: number;
  startDate: Date | null;
  dueDate: Date | null;
  members: { userId: string }[];
}

export function ProjectForm({
  project,
  clients,
  users,
  defaultClientId,
}: {
  project?: ProjectFormValues;
  clients: { id: string; company: string }[];
  users: { id: string; name: string }[];
  defaultClientId?: string;
}) {
  const action = project ? updateProject.bind(null, project.id) : createProject;
  const [state, formAction] = useActionState(action, initialState);
  const memberIds = new Set(project?.members.map((m) => m.userId));

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="name" required>
          Project name
        </Label>
        <Input id="name" name="name" defaultValue={project?.name} required placeholder="Brand new website" />
        <FieldError message={state.fieldErrors?.name} />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="clientId" required>
            Client
          </Label>
          <Select id="clientId" name="clientId" defaultValue={project?.clientId ?? defaultClientId ?? ""} required>
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </Select>
          <FieldError message={state.fieldErrors?.clientId} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={project?.status ?? "PLANNING"} required>
            {Object.entries(PROJECT_STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="budget">Budget (USD)</Label>
          <Input id="budget" name="budget" type="number" min="0" step="100" defaultValue={project?.budget ?? 0} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={toDateInputValue(project?.startDate)} />
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={toDateInputValue(project?.dueDate)} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={project?.description ?? ""} placeholder="Scope, goals, key context…" />
      </FieldGroup>

      <FieldGroup>
        <Label>Team members</Label>
        <div className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 sm:grid-cols-3">
          {users.map((u) => (
            <label key={u.id} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" name="memberIds" value={u.id} defaultChecked={memberIds.has(u.id)} className="rounded border-border text-primary focus:ring-primary" />
              {u.name}
            </label>
          ))}
        </div>
      </FieldGroup>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{project ? "Save changes" : "Create project"}</SubmitButton>
        <LinkButton href={project ? `/projects/${project.id}` : "/projects"} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
