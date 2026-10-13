
import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";

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
