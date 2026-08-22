"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { clientSchema } from "@/lib/validation";
import { type ActionState, flattenZodError, logActivity } from "@/lib/actions/shared";

function parseClientForm(formData: FormData) {
  return clientSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    website: formData.get("website"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    ownerId: formData.get("ownerId"),
  });
}

export async function createClient(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const client = await prisma.client.create({
    data: { ...parsed.data, ownerId: parsed.data.ownerId || null },
  });

  await logActivity(
    `added ${client.company} as a new ${parsed.data.status === "LEAD" ? "lead" : "client"}`,
    "client",
    client.id,
  );

  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClient(clientId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = parseClientForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: { ...parsed.data, ownerId: parsed.data.ownerId || null },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deleteClient(clientId: string) {
  await requireRole(MANAGE_ROLES);
  const client = await prisma.client.delete({ where: { id: clientId } });
  await logActivity(`deleted client ${client.company}`, "client", clientId);
  revalidatePath("/clients");
  redirect("/clients");
}
