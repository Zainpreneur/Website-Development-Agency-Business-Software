"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { TaskStatus } from "@/generated/prisma/enums";
import { requireUser } from "@/lib/session";
import { taskSchema } from "@/lib/validation";
import { type ActionState, flattenZodError, logActivity } from "@/lib/actions/shared";

function parseTaskForm(formData: FormData) {
  return taskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    projectId: formData.get("projectId"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    assigneeId: formData.get("assigneeId"),
    dueDate: formData.get("dueDate"),
  });
}

export async function createTask(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { dueDate, assigneeId, projectId, ...rest } = parsed.data;
  const count = await prisma.task.count({ where: { projectId } });
  await prisma.task.create({
    data: {
      ...rest,
      projectId,
      assigneeId: assigneeId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: count,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/board`);
  revalidatePath("/tasks");
  redirect(`/projects/${projectId}/board`);
}

export async function updateTask(taskId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = parseTaskForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { dueDate, assigneeId, projectId, ...rest } = parsed.data;
  await prisma.task.update({
    where: { id: taskId },
    data: { ...rest, projectId, assigneeId: assigneeId || null, dueDate: dueDate ? new Date(dueDate) : null },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/board`);
  revalidatePath("/tasks");
  redirect(`/projects/${projectId}/board`);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const user = await requireUser();
  const task = await prisma.task.update({ where: { id: taskId }, data: { status }, include: { project: true } });

  if (status === "DONE") {
    await prisma.activity.create({
      data: {
        message: `${user.name} completed "${task.title}"`,
        entity: "task",
        entityId: task.id,
        userId: user.id,
      },
    });
  }

  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath(`/projects/${task.projectId}/board`);
  revalidatePath("/tasks");
}

export async function deleteTask(taskId: string) {
  await requireUser();
  const task = await prisma.task.delete({ where: { id: taskId } });
  await logActivity(`deleted task "${task.title}"`, "task", task.id);
  revalidatePath(`/projects/${task.projectId}`);
  revalidatePath(`/projects/${task.projectId}/board`);
  revalidatePath("/tasks");
  redirect(`/projects/${task.projectId}/board`);
}
