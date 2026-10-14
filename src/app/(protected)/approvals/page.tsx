
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import ApprovalManager from "@/components/approvals/ApprovalManager";
import { getCurrentUser } from "@/server/services/current-user";
import { getPendingApprovals } from "@/server/services/approvals";

async function ApprovalsContent() {
  await connection();

  const user = await getCurrentUser();

  if (
    user.role !== "DEPARTMENT_HEAD" &&
    user.role !== "ADMIN"
  ) {
    redirect("/dashboard");
  }

  const approvals = await getPendingApprovals();

  const serializedApprovals = approvals.map((approval) => ({
    id: approval.id,
    bookingReference: approval.bookingReference,
    purpose: approval.purpose,
    startTime: approval.startTime.toISOString(),
    endTime: approval.endTime.toISOString(),
    createdAt: approval.createdAt.toISOString(),
    status: approval.status,
    user: {
      id: approval.user.id,
      name: approval.user.name,
      email: approval.user.email,
      department: approval.user.department?.name ?? null,
    },
    resource: {
      id: approval.resource.id,
      resourceCode: approval.resource.resourceCode,
      name: approval.resource.name,
      category: approval.resource.category,
      location: approval.resource.location,
      status: approval.resource.status,
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Reservation Management
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-[#14263D]">
          Pending Approvals
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review and manage reservation requests assigned to you.
        </p>
      </div>

      <ApprovalManager approvals={serializedApprovals} />
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-20 animate-pulse rounded-lg bg-white" />
          <div className="h-80 animate-pulse rounded-lg bg-white" />
        </div>
      }
    >
      <ApprovalsContent />
    </Suspense>
  );
}
