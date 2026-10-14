
"use server";

import { revalidatePath } from "next/cache";

import {
  createReservation,
  type ReservationResult,
} from "@/server/services/reservations";

import type { CreateReservationInput } from "@/validations/reservation";

export async function submitReservation(
  input: CreateReservationInput
): Promise<ReservationResult> {
  const result = await createReservation(input);

  if (result.success) {
    revalidatePath("/dashboard");
    revalidatePath("/reservations");
    revalidatePath("/approvals");
    revalidatePath("/resources");

    if (result.reservationId) {
      revalidatePath(`/reservations/${result.reservationId}`);
    }
  }

  return result;
}
