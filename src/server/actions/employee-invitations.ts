
"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import {
  generateActivationToken,
  hashActivationToken,
  sendActivationEmail,
} from "@/server/services/invitations";

const inviteSchema = z.object({
  email: z.string().trim().email().max(254),
  employeeId: z.string().trim().min(2).max(40),
  departmentId: z.string().uuid(),
  role: z.enum(["EMPLOYEE", "DEPARTMENT_HEAD"]),
});

type ActionResult = {
  success: boolean;
  message: string;
};

export async function inviteEmployee(
  input: unknown
): Promise<ActionResult> {
  const currentUser = await getCurrentUser();

  if (currentUser.role !== "ADMIN") {
    return {
      success: false,
      message: "Only administrators can invite employees.",
    };
  }

  const parsed = inviteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please enter valid employee information.",
    };
  }

  const { employeeId, departmentId, role } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  const department = await prisma.department.findUnique({
    where: { id: departmentId },
  });

  if (!department) {
    return {
      success: false,
      message: "Selected department does not exist.",
    };
  }

  if (role === "DEPARTMENT_HEAD" && department.headId) {
    return {
      success: false,
      message:
        "This department already has a head. Change its head assignment before inviting another.",
    };
  }

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing && existing.status !== "INVITED") {
    return {
      success: false,
      message: "An active or inactive account already uses this email.",
    };
  }

  if (existing && existing.employeeId !== employeeId) {
    return {
      success: false,
      message:
        "This invitation already exists with another employee ID.",
    };
  }

  const duplicateEmployeeId = await prisma.user.findUnique({
    where: { employeeId },
  });

  if (
    duplicateEmployeeId &&
    duplicateEmployeeId.email !== email
  ) {
    return {
      success: false,
      message: "This employee ID is already assigned.",
    };
  }

  const token = generateActivationToken();
  const tokenHash = hashActivationToken(token);
  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  try {
    const user = await prisma.$transaction(async (tx) => {
      let invitedUser;

      if (existing) {
        invitedUser = await tx.user.update({
          where: { id: existing.id },
          data: { role, departmentId },
        });
      } else {
        const unusablePassword = await bcrypt.hash(
          randomBytes(32).toString("hex"),
          12
        );

        invitedUser = await tx.user.create({
          data: {
            employeeId,
            name: "Pending Activation",
            email,
            passwordHash: unusablePassword,
            role,
            departmentId,
            status: "INVITED",
          },
        });
      }

      // Invalidate previous invitation links.
      await tx.accountActivationToken.deleteMany({
        where: { userId: invitedUser.id },
      });

      await tx.accountActivationToken.create({
        data: {
          userId: invitedUser.id,
          tokenHash,
          expiresAt,
        },
      });

      return invitedUser;
    });

    try {
      await sendActivationEmail(user.email, token);
    } catch (emailError) {
      // Do not leave a usable invitation link when sending fails.
      await prisma.accountActivationToken.deleteMany({
        where: { userId: user.id, tokenHash },
      });

      return {
        success: false,
        message:
          emailError instanceof Error
            ? emailError.message
            : "Unable to send the invitation email.",
      };
    }

    revalidatePath("/admin/employees");

    return {
      success: true,
      message: `Invitation sent to ${email}.`,
    };
  } catch (error) {
    console.error("Employee invitation failed:", error);

    return {
      success: false,
      message:
        "Unable to create the invitation. Please check the employee details and try again.",
    };
  }
}
