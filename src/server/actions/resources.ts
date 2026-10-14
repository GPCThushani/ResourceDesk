
"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import {
  resourceSchema,
  type ResourceInput,
} from "@/validations/resource";

export type ResourceActionResult = {
  success: boolean;
  message: string;
};

async function requireAdmin() {
  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    throw new Error("You are not authorized to manage resources.");
  }

  return user;
}

async function validateDepartment(
  ownerDepartmentId: string | null
) {
  if (!ownerDepartmentId) return;

  const department = await prisma.department.findUnique({
    where: { id: ownerDepartmentId },
    select: { id: true },
  });

  if (!department) {
    throw new Error("The selected department does not exist.");
  }
}

function actionError(error: unknown): ResourceActionResult {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      success: false,
      message: "This resource code is already in use.",
    };
  }

  return {
    success: false,
    message:
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.",
  };
}

function refreshResourcePages(id?: string) {
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
  revalidatePath("/dashboard");

  if (id) {
    revalidatePath(`/resources/${id}`);
  }
}

export async function createResource(
  input: ResourceInput
): Promise<ResourceActionResult> {
  await requireAdmin();

  const parsed = resourceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid resource data.",
    };
  }

  const data = parsed.data;

  try {
    await validateDepartment(data.ownerDepartmentId);

    const existing = await prisma.resource.findUnique({
      where: { resourceCode: data.resourceCode },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        message: "This resource code is already in use.",
      };
    }

    await prisma.resource.create({
      data: {
        resourceCode: data.resourceCode,
        name: data.name,
        category: data.category,
        description: data.description || null,
        location: data.location || null,
        capacity: data.capacity,
        status: data.status,
        accessScope: data.accessScope,
        requiresApproval: data.requiresApproval,
        ownerDepartmentId: data.ownerDepartmentId,
      },
    });

    refreshResourcePages();

    return {
      success: true,
      message: "Resource created successfully.",
    };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateResource(
  id: string,
  input: ResourceInput
): Promise<ResourceActionResult> {
  await requireAdmin();

  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)) {
    return { success: false, message: "Invalid resource ID." };
  }

  const parsed = resourceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid resource data.",
    };
  }

  const data = parsed.data;

  try {
    await validateDepartment(data.ownerDepartmentId);

    const existing = await prisma.resource.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return { success: false, message: "Resource not found." };
    }

    await prisma.resource.update({
      where: { id },
      data: {
        resourceCode: data.resourceCode,
        name: data.name,
        category: data.category,
        description: data.description || null,
        location: data.location || null,
        capacity: data.capacity,
        status: data.status,
        accessScope: data.accessScope,
        requiresApproval: data.requiresApproval,
        ownerDepartmentId: data.ownerDepartmentId,
      },
    });

    refreshResourcePages(id);

    return {
      success: true,
      message: "Resource updated successfully.",
    };
  } catch (error) {
    return actionError(error);
  }
}
