"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { timeEntrySchema } from "@/lib/validation";
import { type ActionState, flattenZodError } from "@/lib/actions/shared";

export async function createTimeEntry(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = timeEntrySchema.safeParse({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    hours: formData.get("hours"),
    date: formData.get("date"),
    billable: formData.get("billable") === "on",
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { hours, taskId, date, ...rest } = parsed.data;
  await prisma.timeEntry.create({
    data: {
      ...rest,
      userId: user.id,
      taskId: taskId || null,
      minutes: Math.round(hours * 60),
      date: new Date(date),
    },
  });

  revalidatePath("/time");
  revalidatePath("/");
  return {};
}

export async function deleteTimeEntry(entryId: string) {
  const user = await requireUser();
  const entry = await prisma.timeEntry.findUnique({ where: { id: entryId } });
  if (!entry) return;
  if (entry.userId !== user.id && user.role !== "ADMIN") {
    throw new Error("You can only delete your own time entries.");
  }
  await prisma.timeEntry.delete({ where: { id: entryId } });
  revalidatePath("/time");
  revalidatePath("/");
}
