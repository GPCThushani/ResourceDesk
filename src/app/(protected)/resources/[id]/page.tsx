
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

import ReservationForm from "@/components/reservations/ReservationForm";
import { getAccessibleResourceById } from "@/server/services/resources";

type ResourceDetailsPageProps = {
  params: Promise<{ id: string }>;
};

async function ResourceDetailsContent({
  params,
}: ResourceDetailsPageProps) {
  // Next.js 16: Dynamic rendering inside Suspense.
  await connection();

  // Resolve dynamic route params inside Suspense.
  const { id } = await params;

  const resource = await getAccessibleResourceById(id);

  const isBookable = resource.status === "ACTIVE";

  const statusStyles = {
    ACTIVE: "bg-emerald-50 text-emerald-800",
    MAINTENANCE: "bg-amber-50 text-amber-800",
    INACTIVE: "bg-slate-100 text-slate-700",
  };

  const statusLabels = {
    ACTIVE: "Active",
    MAINTENANCE: "Under Maintenance",
    INACTIVE: "Inactive",
  };

  const details = [
    {
      label: "Resource Code",
      value: resource.resourceCode,
    },
    {
      label: "Category",
      value: resource.category,
    },
    {
      label: "Location",
      value: resource.location ?? "Not specified",
    },
    {
      label: "Capacity",
      value:
        resource.capacity !== null
          ? String(resource.capacity)
          : "Not specified",
    },
    {
      label: "Access Scope",
      value:
        resource.accessScope === "ORGANIZATION"
          ? "Organization-wide"
          : "Department only",
    },
    {
      label: "Owning Department",
      value:
        resource.ownerDepartment?.name ?? "Organization",
    },
    {
      label: "Approval Requirement",
      value: resource.requiresApproval
        ? "Approval required"
        : "No approval required",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/resources"
          className="text-sm font-medium text-slate-600 hover:text-[#14263D]"
        >
          ← Back to Resources
        </Link>
      </nav>

      {/* Resource Header */}
      <section className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-sm text-slate-500">
            {resource.resourceCode}
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-[#14263D]">
            {resource.name}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {resource.category}
          </p>
        </div>

        <span
          className={`inline-flex rounded-md px-3 py-2 text-sm font-medium ${
            statusStyles[resource.status]
          }`}
        >
          {statusLabels[resource.status]}
        </span>
      </section>

      {/* Main Content */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        {/* Resource Information */}
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-[#14263D]">
              Resource Information
            </h2>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {detail.label}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-900">
                  {detail.value}
                </p>
              </div>
            ))}
          </div>

          {/* Resource Description */}
          <div className="border-t border-slate-200 px-6 py-5">
            <h3 className="text-sm font-semibold text-[#14263D]">
              Description
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {resource.description ??
                "No description has been provided for this resource."}
            </p>
          </div>
        </section>

        {/* Booking Section */}
        {isBookable ? (
          <div
            id="reservation-form"
            className="min-w-0 scroll-mt-24"
          >
            <ReservationForm
              resourceId={resource.id}
              resourceName={resource.name}
              requiresApproval={resource.requiresApproval}
            />
          </div>
        ) : (
          <aside className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#14263D]">
              Reservations Unavailable
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              This resource cannot currently be booked because
              its status is{" "}
              {statusLabels[resource.status].toLowerCase()}.
            </p>

            <div className="mt-5 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
              Booking will become available when an administrator
              changes the resource status to Active.
            </div>

            <Link
              href="/resources"
              className="mt-6 inline-flex rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-[#14263D] hover:bg-slate-50"
            >
              Browse Other Resources
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}

// Main Page Component
export default function ResourceDetailsPage({
  params,
}: ResourceDetailsPageProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-lg bg-white" />
            <div className="h-96 animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      }
    >
      <ResourceDetailsContent params={params} />
    </Suspense>
  );
}
