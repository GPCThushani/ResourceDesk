
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import AdminResourceManager from "@/components/resources/AdminResourceManager";

async function AdminResourcesContent() {
  await connection();

  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [resources, departments] = await Promise.all([
    prisma.resource.findMany({
      select: {
        id: true,
        resourceCode: true,
        name: true,
        category: true,
        description: true,
        location: true,
        capacity: true,
        status: true,
        accessScope: true,
        requiresApproval: true,
        ownerDepartmentId: true,
        ownerDepartment: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      select: {
        id: true,
        name: true,
        departmentCode: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminResourceManager
      resources={resources}
      departments={departments}
    />
  );
}

export default function AdminResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="h-80 animate-pulse rounded-lg border border-slate-200 bg-white" />
      }
    >
      <AdminResourcesContent />
    </Suspense>
  );
}
