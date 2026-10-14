
import { z } from "zod";

export const createReservationSchema = z
  .object({
    resourceId: z.string().uuid("Invalid resource ID."),

    purpose: z
      .string()
      .trim()
      .min(5, "Purpose must contain at least 5 characters.")
      .max(500, "Purpose cannot exceed 500 characters."),

    startTime: z.string().datetime({
      offset: true,
      message: "Enter a valid start date and time with a timezone.",
    }),

    endTime: z.string().datetime({
      offset: true,
      message: "Enter a valid end date and time with a timezone.",
    }),
  })
  .superRefine((data, context) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (end <= start) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time.",
      });
      return;
    }

    const durationMinutes =
      (end.getTime() - start.getTime()) / 60000;

    if (durationMinutes < 30) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Minimum booking duration is 30 minutes.",
      });
    }

    if (durationMinutes > 480) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Maximum booking duration is 8 hours.",
      });
    }
  });

export type CreateReservationInput = z.input<
  typeof createReservationSchema
>;
