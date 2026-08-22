"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";

import { createTask, updateTask } from "@/lib/actions/tasks";
import type { ActionState } from "@/lib/actions/shared";
import { Input, Textarea, Select, Label, FieldGroup, FieldError } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { LinkButton } from "@/components/ui/button";
import { TASK_STATUS, TASK_PRIORITY } from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";

const initialState: ActionState = {};

interface TaskFormValues {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId: string | null;
  dueDate: Date | null;
}

export function TaskForm({
  task,
  projectId,
  users,
  backHref,
}: {
  task?: TaskFormValues;
  projectId: string;
  users: { id: string; name: string }[];
  backHref: string;
}) {
  const action = task ? updateTask.bind(null, task.id) : createTask;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />

      {state?.error && (
        <div className="flex items-start gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <FieldGroup>
        <Label htmlFor="title" required>
          Title
        </Label>
        <Input id="title" name="title" defaultValue={task?.title} required placeholder="What needs to happen?" />
        <FieldError message={state.fieldErrors?.title} />
      </FieldGroup>

      <FieldGroup>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={task?.description ?? ""} placeholder="Additional detail…" />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="status" required>
            Status
          </Label>
          <Select id="status" name="status" defaultValue={task?.status ?? "TODO"} required>
            {Object.entries(TASK_STATUS).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="priority" required>
            Priority
          </Label>
          <Select id="priority" name="priority" defaultValue={task?.priority ?? "MEDIUM"} required>
            {Object.entries(TASK_PRIORITY).map(([value, meta]) => (
              <option key={value} value={value}>
                {meta.label}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="assigneeId">Assignee</Label>
          <Select id="assigneeId" name="assigneeId" defaultValue={task?.assigneeId ?? ""}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </Select>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="dueDate">Due date</Label>
          <Input id="dueDate" name="dueDate" type="date" defaultValue={toDateInputValue(task?.dueDate)} />
        </FieldGroup>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <SubmitButton>{task ? "Save changes" : "Create task"}</SubmitButton>
        <LinkButton href={backHref} variant="secondary">
          Cancel
        </LinkButton>
      </div>
    </form>
  );
}
