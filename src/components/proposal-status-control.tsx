"use client";

import { StatusSelect } from "@/components/status-select";
import { updateProposalStatus } from "@/lib/actions/proposals";
import { PROPOSAL_STATUS } from "@/lib/constants";
import type { ProposalStatus } from "@/generated/prisma/enums";

export function ProposalStatusControl({ proposalId, status }: { proposalId: string; status: ProposalStatus }) {
  return (
    <StatusSelect value={status} options={PROPOSAL_STATUS} onChange={(next) => updateProposalStatus(proposalId, next)} />
  );
}
