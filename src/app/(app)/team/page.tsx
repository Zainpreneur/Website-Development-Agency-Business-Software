import { prisma } from "@/lib/prisma";
import { requireRole, ADMIN_ROLES } from "@/lib/session";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { TeamMemberForm } from "@/components/forms/team-member-form";
import { TeamMemberRow } from "@/components/team-member-row";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const currentUser = await requireRole(ADMIN_ROLES);

  const members = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count: { select: { assignedTasks: true, projectMembers: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Team</h1>
          <p className="mt-1 text-sm text-muted">{members.filter((m) => m.active).length} active members</p>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Add a team member"
          description="New members can sign in immediately with the password you set."
        />
        <CardBody>
          <div className="max-w-lg">
            <TeamMemberForm />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Members" />
        <div className="divide-y divide-border">
          {members.map((member) => (
            <TeamMemberRow
              key={member.id}
              currentUserId={currentUser.id}
              member={{
                id: member.id,
                name: member.name,
                email: member.email,
                title: member.title,
                role: member.role,
                avatarColor: member.avatarColor,
                active: member.active,
                createdAt: member.createdAt,
                projectCount: member._count.projectMembers,
                taskCount: member._count.assignedTasks,
              }}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
