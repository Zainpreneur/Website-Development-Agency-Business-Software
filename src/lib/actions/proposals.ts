"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import type { ProposalStatus } from "@/generated/prisma/enums";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { proposalSchema } from "@/lib/validation";
import { type ActionState, flattenZodError, logActivity } from "@/lib/actions/shared";

function parseProposalForm(formData: FormData) {
  return proposalSchema.safeParse({
    clientId: formData.get("clientId"),
    title: formData.get("title"),
    status: formData.get("status"),
    amount: formData.get("amount"),
    validUntil: formData.get("validUntil"),
    content: formData.get("content"),
  });
}

export async function createProposal(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(MANAGE_ROLES);
  const parsed = parseProposalForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { validUntil, ...rest } = parsed.data;
  const proposal = await prisma.proposal.create({
    data: { ...rest, validUntil: validUntil ? new Date(validUntil) : null, ownerId: user.id },
  });

  await logActivity(`created proposal "${proposal.title}"`, "proposal", proposal.id);

  revalidatePath("/proposals");
  redirect(`/proposals/${proposal.id}`);
}

export async function updateProposal(proposalId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole(MANAGE_ROLES);
  const parsed = parseProposalForm(formData);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: flattenZodError(parsed.error) };
  }

  const { validUntil, ...rest } = parsed.data;
  await prisma.proposal.update({
    where: { id: proposalId },
    data: { ...rest, validUntil: validUntil ? new Date(validUntil) : null },
  });

  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
  redirect(`/proposals/${proposalId}`);
}

export async function updateProposalStatus(proposalId: string, status: ProposalStatus) {
  await requireRole(MANAGE_ROLES);
  const proposal = await prisma.proposal.update({ where: { id: proposalId }, data: { status } });
  await logActivity(`marked proposal "${proposal.title}" as ${status.toLowerCase()}`, "proposal", proposal.id);
  revalidatePath("/proposals");
  revalidatePath(`/proposals/${proposalId}`);
}

export async function deleteProposal(proposalId: string) {
  await requireRole(MANAGE_ROLES);
  const proposal = await prisma.proposal.delete({ where: { id: proposalId } });
  await logActivity(`deleted proposal "${proposal.title}"`, "proposal", proposalId);
  revalidatePath("/proposals");
  redirect("/proposals");
}
