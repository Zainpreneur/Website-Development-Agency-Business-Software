"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/session";
import { teamMemberSchema } from "@/lib/validation";
import { type ActionState, flattenZodError, logActivity } from "@/lib/actions/shared";

const AVATAR_COLORS = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444"];

function randomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]!;
}

export async function createTeamMember(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(ADMIN_ROLES);
  const parsed = teamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) {
    return { error: "A team member with that email already exists.", fieldErrors: { email: "Already in use" } };
  }

  if (!parsed.data.password) {
    return { error: "A password is required for new team members.", fieldErrors: { password: "Required" } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const member = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      title: parsed.data.title || null,
      role: parsed.data.role,
      passwordHash,
      avatarColor: randomColor(),
    },
  });

  await logActivity(`added ${member.name} to the team`, "user", member.id);

  revalidatePath("/team");
  return {};
}

export async function updateTeamMember(userId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(ADMIN_ROLES);
  const parsed = teamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    title: formData.get("title"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const data: Record<string, unknown> = {
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    title: parsed.data.title || null,
    role: parsed.data.role,
  };

  if (parsed.data.password) {
    data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  }

  await prisma.user.update({ where: { id: userId }, data });
  revalidatePath("/team");
  return {};
}

export async function toggleTeamMemberActive(userId: string, active: boolean) {
  const currentUser = await requireRole(ADMIN_ROLES);
  if (currentUser.id === userId && !active) {
    throw new Error("You can't deactivate your own account.");
  }
  const member = await prisma.user.update({ where: { id: userId }, data: { active } });
  await logActivity(`${active ? "reactivated" : "deactivated"} ${member.name}`, "user", member.id);
  revalidatePath("/team");
}
