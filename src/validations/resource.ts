
import { z } from "zod";

export const resourceSchema = z
  .object({
    resourceCode: z
      .string()
      .trim()
      .min(2, "Resource code must contain at least 2 characters.")
      .max(40)
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Use letters, numbers, hyphens, or underscores."
      )
      .transform((value) => value.toUpperCase()),

    name: z.string().trim().min(2).max(120),

    category: z.string().trim().min(2).max(80),

    description: z.string().trim().max(1000),

    location: z.string().trim().max(150),

    capacity: z
      .union([z.number().int().positive().max(100000), z.null()]),

    status: z.enum(["ACTIVE", "MAINTENANCE", "INACTIVE"]),

    accessScope: z.enum(["ORGANIZATION", "DEPARTMENT"]),

    requiresApproval: z.boolean(),

    ownerDepartmentId: z.union([z.uuid(), z.null()]),
  })
  .superRefine((data, context) => {
    if (
      data.accessScope === "DEPARTMENT" &&
      !data.ownerDepartmentId
    ) {
      context.addIssue({
        code: "custom",
        path: ["ownerDepartmentId"],
        message: "Select an owning department for department-only access.",
      });
    }
  });

export type ResourceInput = z.input<typeof resourceSchema>;
