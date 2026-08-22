"use client";

import { StatusSelect } from "@/components/status-select";
import { updateProjectStatus } from "@/lib/actions/projects";
import { PROJECT_STATUS } from "@/lib/constants";
import type { ProjectStatus } from "@/generated/prisma/enums";

export function ProjectStatusControl({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  return (
    <StatusSelect
      value={status}
      options={PROJECT_STATUS}
      onChange={(next) => updateProjectStatus(projectId, next)}
    />
  );
}
