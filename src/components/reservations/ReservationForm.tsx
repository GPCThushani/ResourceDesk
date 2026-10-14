
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitReservation } from "@/server/actions/reservations";

type Props = {
  resourceId: string;
  resourceName: string;
  requiresApproval: boolean;
};

type BookingResult = {
  success: boolean;
  message: string;
  bookingReference?: string;
  status?: "PENDING" | "CONFIRMED";
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#14263D] focus:ring-1 focus:ring-[#14263D]";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

function toLocalIsoWithOffset(value: string) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) return null;

  const [, year, month, day, hour, minute] = match;

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  );

  if (
    date.getFullYear() !== Number(year) ||
    date.getMonth() !== Number(month) - 1 ||
    date.getDate() !== Number(day) ||
    date.getHours() !== Number(hour) ||
    date.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);

  const offsetHours = String(
    Math.floor(absoluteOffset / 60)
  ).padStart(2, "0");

  const offsetRemainingMinutes = String(
    absoluteOffset % 60
  ).padStart(2, "0");

  return `${value}:00${sign}${offsetHours}:${offsetRemainingMinutes}`;
}

export default function ReservationForm({
  resourceId,
  resourceName,
  requiresApproval,
}: Props) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [purpose, setPurpose] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const start = toLocalIsoWithOffset(startTime);
    const end = toLocalIsoWithOffset(endTime);

    if (!start || !end) {
      setResult({
        success: false,
        message: "Please enter valid booking dates and times.",
      });
      return;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMinutes =
      (endDate.getTime() - startDate.getTime()) / 60000;

    if (startDate <= new Date()) {
      setResult({
        success: false,
        message: "Start time must be in the future.",
      });
      return;
    }

    if (durationMinutes < 30 || durationMinutes > 480) {
      setResult({
        success: false,
        message: "Booking duration must be between 30 minutes and 8 hours.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await submitReservation({
          resourceId,
          purpose,
          startTime: start,
          endTime: end,
        });

        setResult(response);

        if (response.success) {
          setStartTime("");
          setEndTime("");
          setPurpose("");
        }
      } catch {
        setResult({
          success: false,
          message: "Unable to submit the reservation. Please try again.",
        });
      }
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-[#14263D]">
          Book Resource
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Submit a reservation for {resourceName}.
        </p>
      </div>

      {result?.success ? (
        <div className="space-y-5 p-6">
          <div
            role="status"
            className="rounded-md border border-emerald-200 bg-emerald-50 p-5"
          >
            <h3 className="font-semibold text-emerald-900">
              {result.status === "CONFIRMED"
                ? "Reservation Confirmed"
                : "Reservation Submitted"}
            </h3>

            <p className="mt-2 text-sm text-emerald-800">
              {result.message}
            </p>

            <div className="mt-4 border-t border-emerald-200 pt-4">
              <p className="text-xs font-medium text-emerald-800">
                Booking Reference
              </p>
              <p className="mt-1 break-all text-lg font-semibold text-emerald-950">
                {result.bookingReference}
              </p>

              <p className="mt-3 text-sm text-emerald-800">
                Status:{" "}
                <strong>
                  {result.status === "CONFIRMED"
                    ? "Confirmed"
                    : "Pending Approval"}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setResult(null)}
              className="rounded-md bg-[#14263D] px-4 py-2.5 text-sm font-medium text-white"
            >
              Make Another Reservation
            </button>

            <Link
              href="/dashboard"
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {result && !result.success && (
            <div
              role="alert"
              className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {result.message}
            </div>
          )}

          <div>
            <label htmlFor="booking-start" className={labelClass}>
              Start Date & Time *
            </label>
            <input
              id="booking-start"
              type="datetime-local"
              required
              step={60}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="booking-end" className={labelClass}>
              End Date & Time *
            </label>
            <input
              id="booking-end"
              type="datetime-local"
              required
              step={60}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="booking-purpose" className={labelClass}>
              Booking Purpose *
            </label>
            <textarea
              id="booking-purpose"
              rows={4}
              required
              minLength={5}
              maxLength={500}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              placeholder="Describe why you need this resource..."
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              5–500 characters.
            </p>
          </div>

          <div className="rounded-md bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-800">
              {requiresApproval
                ? "This reservation requires approval."
                : "This resource does not require manual approval."}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-600">
              {requiresApproval
                ? "Your request will be submitted to the assigned department head."
                : "Your reservation will be confirmed if the selected time is available."}
            </p>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-md bg-[#14263D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#223D5C] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Submitting Reservation..."
              : requiresApproval
                ? "Submit Approval Request"
                : "Confirm Reservation"}
          </button>

          <p className="text-xs leading-5 text-slate-500">
            Reservations must start in the future, last between
            30 minutes and 8 hours, and be made no more than
            30 days in advance.
          </p>
        </form>
      )}
    </section>
  );
}
