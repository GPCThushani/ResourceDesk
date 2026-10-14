
import { Suspense } from "react";
import { connection } from "next/server";

import QuickReservation from "@/components/reservations/QuickReservation";
import { getAccessibleResources } from "@/server/services/resources";

async function NewReservationContent() {
  await connection();

  const resources = await getAccessibleResources();

  return <QuickReservation resources={resources} />;
}

export default function NewReservationPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-80 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-lg bg-white" />
            <div className="h-96 animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      }
    >
      <NewReservationContent />
    </Suspense>
  );
}
