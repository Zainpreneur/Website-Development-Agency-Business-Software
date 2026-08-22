"use client";

import { StatusSelect } from "@/components/status-select";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { TASK_STATUS } from "@/lib/constants";
import type { TaskStatus } from "@/generated/prisma/enums";

export function TaskStatusControl({ taskId, status }: { taskId: string; status: TaskStatus }) {
  return <StatusSelect value={status} options={TASK_STATUS} onChange={(next) => updateTaskStatus(taskId, next)} />;
}
