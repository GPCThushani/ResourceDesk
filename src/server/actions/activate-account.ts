
"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  findValidActivation,
  hashActivationToken,
} from "@/server/services/invitations";

const activationSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  name: z.string().trim().min(2).max(100),
  password: z.string().min(12).max(128),
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  }
);

type ActivationResult = {
  success: boolean;
  message: string;
};

export async function activateAccount(
  input: unknown
): Promise<ActivationResult> {
  const parsed = activationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Enter a valid name and matching passwords of at least 12 characters.",
    };
  }

  const { token, name, password } = parsed.data;

  const activation = await findValidActivation(token);

  if (!activation) {
    return {
      success: false,
      message:
        "This activation link is invalid, expired, or already used. Please contact your administrator.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const tokenHash = hashActivationToken(token);

  try {
    await prisma.$transaction(async (tx) => {
      // Atomically claim the token to prevent reuse.
      const claimed = await tx.accountActivationToken.updateMany({
        where: {
          id: activation.id,
          tokenHash,
          usedAt: null,
          expiresAt: { gt: new Date() },
        },
        data: {
          usedAt: new Date(),
        },
      });

      if (claimed.count !== 1) {
        throw new Error("ACTIVATION_LINK_USED");
      }

      const updatedUser = await tx.user.updateMany({
        where: {
          id: activation.userId,
          status: "INVITED",
        },
        data: {
          name,
          passwordHash,
          status: "ACTIVE",
        },
      });

      if (updatedUser.count !== 1) {
        throw new Error("ACCOUNT_ALREADY_ACTIVATED");
      }

      // Ensure a newly activated department head is also
      // recorded as the head of their assigned department.
      if (
        activation.user.role === "DEPARTMENT_HEAD" &&
        activation.user.departmentId
      ) {
        const assigned = await tx.department.updateMany({
          where: {
            id: activation.user.departmentId,
            headId: null,
          },
          data: {
            headId: activation.userId,
          },
        });

        if (assigned.count !== 1) {
          throw new Error("DEPARTMENT_HEAD_ALREADY_ASSIGNED");
        }
      }

      await tx.accountActivationToken.deleteMany({
        where: {
          userId: activation.userId,
          id: { not: activation.id },
        },
      });
    });

    return {
      success: true,
      message:
        "Your account has been activated successfully. You can now sign in.",
    };
  } catch (error) {
    console.error("Account activation failed:", error);

    return {
      success: false,
      message:
        "Unable to activate this account. The link may have expired, or the department assignment may need administrator review.",
    };
  }
}
