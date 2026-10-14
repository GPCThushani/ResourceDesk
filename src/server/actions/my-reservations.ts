
"use server";

import { revalidatePath } from "next/cache";

import {
  cancelMyReservation,
  type CancellationResult,
} from "@/server/services/my-reservations";

export async function cancelReservationAction(
  reservationId: string
): Promise<CancellationResult> {
  const result = await cancelMyReservation(reservationId);

  if (result.success) {
    revalidatePath("/reservations");
    revalidatePath("/dashboard");
    revalidatePath("/approvals");
    revalidatePath("/resources");
  }

  return result;
}
