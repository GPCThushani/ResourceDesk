
import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      departmentId: true,
      department: {
        select: {
          id: true,
          name: true,
          departmentCode: true,
        },
      },
    },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  return user;
}

export type CurrentUser = Awaited<
  ReturnType<typeof getCurrentUser>
>;
