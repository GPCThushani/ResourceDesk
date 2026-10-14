
"use server";

import { revalidatePath } from "next/cache";

import {
  reviewReservation,
  type ApprovalResult,
} from "@/server/services/approvals";

export async function approveReservation(
  reservationId: string
): Promise<ApprovalResult> {
  const result = await reviewReservation(
    reservationId,
    "APPROVE"
  );

  if (result.success) {
    revalidatePath("/approvals");
    revalidatePath("/reservations");
    revalidatePath("/dashboard");
    revalidatePath("/resources");
  }

  return result;
}

export async function rejectReservation(
  reservationId: string,
  rejectionReason: string
): Promise<ApprovalResult> {
  const result = await reviewReservation(
    reservationId,
    "REJECT",
    rejectionReason
  );

  if (result.success) {
    revalidatePath("/approvals");
    revalidatePath("/reservations");
    revalidatePath("/dashboard");
  }

  return result;
}
