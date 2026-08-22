import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole, MANAGE_ROLES } from "@/lib/session";
import { ProjectForm } from "@/components/forms/project-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "Edit Project" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(MANAGE_ROLES);
  const { id } = await params;

  const [project, clients, users] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { members: true } }),
    prisma.client.findMany({ orderBy: { company: "asc" }, select: { id: true, company: true } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Edit {project.name}</h1>
      </div>
      <Card>
        <CardHeader title="Project details" />
        <CardBody>
          <ProjectForm project={project} clients={clients} users={users} />
        </CardBody>
      </Card>
    </div>
  );
}
