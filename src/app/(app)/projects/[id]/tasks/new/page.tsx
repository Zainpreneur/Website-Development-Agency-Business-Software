import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TaskForm } from "@/components/forms/task-form";
import { Card, CardHeader, CardBody } from "@/components/ui/card";

export const metadata = { title: "New Task" };

export default async function NewTaskPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;

  const [project, users] = await Promise.all([
    prisma.project.findUnique({ where: { id }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">New Task</h1>
        <p className="mt-1 text-sm text-muted">for {project.name}</p>
      </div>
      <Card>
        <CardHeader title="Task details" />
        <CardBody>
          <TaskForm projectId={project.id} users={users} backHref={`/projects/${project.id}/board`} />
        </CardBody>
      </Card>
    </div>
  );
}
