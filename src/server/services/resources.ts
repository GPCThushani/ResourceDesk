
import "server-only";

import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";

// =====================================================
// 1. Get Accessible Resources
// =====================================================

export async function getAccessibleResources() {
  const user = await getCurrentUser();

  const visibility: Prisma.ResourceWhereInput[] = [
    { accessScope: "ORGANIZATION" },
  ];

  // Employees and department heads can access
  // resources belonging to their own department.
  if (user.departmentId) {
    visibility.push({
      accessScope: "DEPARTMENT",
      ownerDepartmentId: user.departmentId,
    });
  }

  return prisma.resource.findMany({
    where:
      user.role === "ADMIN"
        ? {}
        : { OR: visibility },

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

      ownerDepartment: {
        select: {
          name: true,
        },
      },
    },

    orderBy: [
      { category: "asc" },
      { name: "asc" },
    ],
  });
}

// Type used by the ResourceDirectory component.
export type ResourceDirectoryItem = Awaited<
  ReturnType<typeof getAccessibleResources>
>[number];

// =====================================================
// 2. Get Accessible Resource by ID
// =====================================================

export async function getAccessibleResourceById(id: string) {
  const user = await getCurrentUser();

  // Validate UUID before querying PostgreSQL.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    notFound();
  }

  const visibility: Prisma.ResourceWhereInput[] = [
    { accessScope: "ORGANIZATION" },
  ];

  // Department-specific access for non-admin users.
  if (user.departmentId) {
    visibility.push({
      accessScope: "DEPARTMENT",
      ownerDepartmentId: user.departmentId,
    });
  }

  const resource = await prisma.resource.findFirst({
    where: {
      id,

      // Administrators can view every resource.
      // Other users must satisfy visibility rules.
      ...(user.role === "ADMIN"
        ? {}
        : { OR: visibility }),
    },

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
      createdAt: true,
      updatedAt: true,

      ownerDepartment: {
        select: {
          name: true,
          departmentCode: true,
        },
      },
    },
  });

  // Prevent access to missing or unauthorized resources.
  if (!resource) {
    notFound();
  }

  return resource;
}
