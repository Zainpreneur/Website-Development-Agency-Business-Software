"use client";

import { useState } from "react";
import { Pencil, UserCheck, UserX } from "lucide-react";

import { toggleTeamMemberActive } from "@/lib/actions/team";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/submit-button";
import { TeamMemberForm } from "@/components/forms/team-member-form";

interface Member {
  id: string;
  name: string;
  email: string;
  title: string | null;
  role: string;
  avatarColor: string;
  active: boolean;
  createdAt: Date;
  projectCount: number;
  taskCount: number;
}

export function TeamMemberRow({ member, currentUserId }: { member: Member; currentUserId: string }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={member.name} color={member.avatarColor} />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{member.name}</p>
              {!member.active && <Badge label="Inactive" tone="gray" />}
            </div>
            <p className="text-sm text-muted">{member.title || member.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={member.role} map={ROLE_LABEL} />
          <span className="hidden text-xs text-muted sm:inline">
            {member.projectCount} projects · {member.taskCount} tasks
          </span>
          <span className="hidden text-xs text-muted lg:inline">Joined {formatDate(member.createdAt)}</span>

          <Button variant="ghost" size="icon" onClick={() => setEditing((e) => !e)} aria-label="Edit member">
            <Pencil className="h-4 w-4" />
          </Button>

          {member.id !== currentUserId && (
            <form action={toggleTeamMemberActive.bind(null, member.id, !member.active)}>
              <ConfirmSubmitButton
                variant="ghost"
                size="icon"
                confirmMessage={member.active ? `Deactivate ${member.name}? They won't be able to sign in.` : `Reactivate ${member.name}?`}
                aria-label={member.active ? "Deactivate" : "Reactivate"}
              >
                {member.active ? <UserX className="h-4 w-4 text-muted" /> : <UserCheck className="h-4 w-4 text-muted" />}
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-3 w-full max-w-lg rounded-md border border-border bg-background p-4">
          <TeamMemberForm member={member} onSuccess={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}
