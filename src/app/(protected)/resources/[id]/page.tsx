
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";

import { getAccessibleResourceById } from "@/server/services/resources";

type ResourceDetailsPageProps = {
  params: Promise<{ id: string }>;
};

async function ResourceDetailsContent({
  id,
}: {
  id: string;
}) {
  await connection();

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
      value: resource.ownerDepartment?.name ?? "Organization",
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
      <nav aria-label="Breadcrumb">
        <Link
          href="/resources"
          className="text-sm font-medium text-slate-600 hover:text-[#14263D]"
        >
          ← Back to Resources
        </Link>
      </nav>

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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
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

        <aside className="h-fit rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-[#14263D]">
            Reservation Information
          </h2>

          <p className="mt-4 text-sm text-slate-600">
            {isBookable
              ? "This resource is active and eligible for reservation requests."
              : "This resource is currently unavailable for reservations."}
          </p>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Approval Process
            </p>

            <p className="mt-2 text-sm text-slate-800">
              {resource.requiresApproval
                ? "A designated department head must approve the reservation."
                : "Reservations do not require manual approval."}
            </p>
          </div>

          {isBookable ? (
            <div className="mt-6 rounded-md bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-800">
                Booking will be available in Phase 5
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Reservation creation and time-slot availability
                checks are being implemented next.
              </p>
            </div>
          ) : (
            <p className="mt-6 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
              Booking is disabled while this resource is
              inactive or under maintenance.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

export default async function ResourceDetailsPage({
  params,
}: ResourceDetailsPageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="h-96 animate-pulse rounded-lg bg-white" />
            <div className="h-64 animate-pulse rounded-lg bg-white" />
          </div>
        </div>
      }
    >
      <ResourceDetailsContent id={id} />
    </Suspense>
  );
}
