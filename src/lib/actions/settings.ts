"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { type ActionState, flattenZodError } from "@/lib/actions/shared";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  title: z.string().trim().optional().or(z.literal("")),
});

export async function updateProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, title: parsed.data.title || null },
  });

  revalidatePath("/settings");
  return {};
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Minimum 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const sessionUser = await requireUser();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect.", fieldErrors: { currentPassword: "Incorrect password" } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return {};
}
