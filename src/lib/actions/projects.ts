"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@/generated/prisma/enums";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { projectSchema } from "@/lib/validation";
import { type ActionState, flattenZodError, logActivity } from "@/lib/actions/shared";

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
    status: formData.get("status"),
    budget: formData.get("budget"),
    startDate: formData.get("startDate"),
    dueDate: formData.get("dueDate"),
    memberIds: formData.getAll("memberIds"),
  });
}

export async function createProject(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { memberIds, startDate, dueDate, ...rest } = parsed.data;
  const project = await prisma.project.create({
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      members: { create: memberIds.map((userId) => ({ userId })) },
    },
  });

  await logActivity(`created project "${project.name}"`, "project", project.id);

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(projectId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { memberIds, startDate, dueDate, ...rest } = parsed.data;
  await prisma.$transaction([
    prisma.project.update({
      where: { id: projectId },
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    }),
    prisma.projectMember.deleteMany({ where: { projectId } }),
    prisma.projectMember.createMany({ data: memberIds.map((userId) => ({ projectId, userId })) }),
  ]);

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  await requireRole(MANAGE_ROLES);
  const project = await prisma.project.update({ where: { id: projectId }, data: { status } });
  await logActivity(`moved "${project.name}" to ${status.replace("_", " ").toLowerCase()}`, "project", projectId);
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  await requireRole(MANAGE_ROLES);
  const project = await prisma.project.delete({ where: { id: projectId } });
  await logActivity(`deleted project "${project.name}"`, "project", projectId);
  revalidatePath("/projects");
  redirect("/projects");
}
