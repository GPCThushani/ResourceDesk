
import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import { notFound } from "next/navigation";
import { Prisma } from "@prisma/client";

export async function getAccessibleResources() {
  const user = await getCurrentUser();

  return prisma.resource.findMany({
    where: {
      OR: [
        { accessScope: "ORGANIZATION" },
        ...(user.departmentId
          ? [
              {
                accessScope: "DEPARTMENT" as const,
                ownerDepartmentId: user.departmentId,
              },
            ]
          : []),
      ],
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

export type ResourceDirectoryItem = Awaited<
  ReturnType<typeof getAccessibleResources>
>[number];


export async function getAccessibleResourceById(id: string) {
  const user = await getCurrentUser();

  // Validate the UUID before querying PostgreSQL.
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidPattern.test(id)) {
    notFound();
  }

  const visibility: Prisma.ResourceWhereInput[] = [
    { accessScope: "ORGANIZATION" },
  ];

  if (user.departmentId) {
    visibility.push({
      accessScope: "DEPARTMENT",
      ownerDepartmentId: user.departmentId,
    });
  }

  const resource = await prisma.resource.findFirst({
    where: {
      id,
      OR: visibility,
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

  if (!resource) {
    notFound();
  }

  return resource;
}
