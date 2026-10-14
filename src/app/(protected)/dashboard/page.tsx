
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";

async function DashboardContent() {
  await connection();

  const user = await getCurrentUser();
  const now = new Date();

  // Admins can access all resources.
  // Other users can access organization-wide resources
  // and resources belonging to their own department.
  const resourceVisibility: Prisma.ResourceWhereInput =
    user.role === "ADMIN"
      ? {}
      : {
          OR: [
            { accessScope: "ORGANIZATION" },
            ...(user.departmentId
              ? [
                  {
                    accessScope: "DEPARTMENT" as const,
                    ownerDepartmentId: user.departmentId,
                  },
                ]
              : []),
          ],
        };

  // Pending request count depends on the user's role.
  const pendingRequestFilter: Prisma.ReservationWhereInput =
    user.role === "ADMIN"
      ? {
          status: "PENDING",
        }
      : user.role === "DEPARTMENT_HEAD"
        ? {
            status: "PENDING",
            approverId: user.id,
          }
        : {
            status: "PENDING",
            userId: user.id,
          };

  const [
    activeResources,
    myReservations,
    pendingRequests,
    myUpcomingBookings,
    sharedUpcomingBookings,
  ] = await Promise.all([
    // Active resources accessible to the current user.
    prisma.resource.count({
      where: {
        status: "ACTIVE",
        ...resourceVisibility,
      },
    }),

    // Total reservations created by the current user.
    prisma.reservation.count({
      where: {
        userId: user.id,
      },
    }),

    // Employees: their pending reservations.
    // Department Heads: requests awaiting their approval.
    // Admins: all pending requests.
    prisma.reservation.count({
      where: pendingRequestFilter,
    }),

    // Current user's confirmed upcoming bookings.
    prisma.reservation.count({
      where: {
        userId: user.id,
        status: "CONFIRMED",
        startTime: {
          gt: now,
        },
      },
    }),
    
    prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        endTime: {
          gt: now,
        },
        resource: resourceVisibility,
      },

      select: {
        id: true,
        bookingReference: true,
        startTime: true,
        endTime: true,

        resource: {
          select: {
            id: true,
            name: true,
            resourceCode: true,
            category: true,
            location: true,
          },
        },
      },

      orderBy: [
        { startTime: "asc" },
        { id: "asc" },
      ],

      take: 10,
    }),
  ]);

  const pendingCard =
    user.role === "DEPARTMENT_HEAD"
      ? {
          label: "Pending Approvals",
          value: pendingRequests,
          description: "Requests awaiting your review",
        }
      : user.role === "ADMIN"
        ? {
            label: "Pending Approvals",
            value: pendingRequests,
            description: "Requests awaiting approval system-wide",
          }
        : {
            label: "Pending Requests",
            value: pendingRequests,
            description: "Your requests awaiting approval",
          };

  const statistics = [
    {
      label: "Active Resources",
      value: activeResources,
      description: "Resources accessible to you",
    },
    {
      label: "My Reservations",
      value: myReservations,
      description: "Total reservation requests",
    },
    pendingCard,
    {
      label: "My Upcoming Bookings",
      value: myUpcomingBookings,
      description: "Your confirmed future bookings",
    },
  ];

  const formatDateTime = (date: Date) =>
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Colombo",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#14263D]">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Welcome back, {user.name}. Here is your workspace overview.
          </p>
        </div>

        <Link
          href="/reservations/new"
          className="inline-flex items-center rounded-md bg-[#14263D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#223D5C]"
        >
          + New Reservation
        </Link>
      </section>

      {/* Dashboard Statistics */}
      <section
        aria-label="Dashboard statistics"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statistics.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-6"
          >
            <p className="text-sm font-medium text-slate-600">
              {stat.label}
            </p>

            <p className="mt-3 text-3xl font-semibold text-[#14263D]">
              {stat.value}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {stat.description}
            </p>
          </div>
        ))}
      </section>

      {/* Upcoming Resource Bookings */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#14263D]">
              Upcoming Resource Bookings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              The next 10 confirmed bookings for resources you can access,
              including reservations made by other employees.
            </p>
          </div>

          <Link
            href="/resources"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-[#14263D] transition hover:bg-slate-50"
          >
            Browse Resources
          </Link>
        </div>

        {sharedUpcomingBookings.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#14263D"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="16"
                  rx="2"
                />
                <path d="M16 3v4M8 3v4M3 10h18" />
              </svg>
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-800">
              No upcoming confirmed bookings
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are currently no upcoming confirmed reservations
              for resources you can access.
            </p>

            <Link
              href="/reservations/new"
              className="mt-5 inline-flex rounded-md bg-[#14263D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#223D5C]"
            >
              Make a Reservation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-6 py-4">
                    Resource
                  </th>

                  <th scope="col" className="px-6 py-4">
                    Category
                  </th>

                  <th scope="col" className="px-6 py-4">
                    Location
                  </th>

                  <th scope="col" className="px-6 py-4">
                    Start Time
                  </th>

                  <th scope="col" className="px-6 py-4">
                    End Time
                  </th>

                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 text-right"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sharedUpcomingBookings.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="align-top transition-colors hover:bg-slate-50"
                  >
                    {/* Resource */}
                    <td className="px-6 py-4">
                      <Link
                        href={`/resources/${reservation.resource.id}`}
                        className="font-semibold text-[#14263D] hover:underline"
                      >
                        {reservation.resource.name}
                      </Link>

                      <p className="mt-1 text-xs text-slate-500">
                        {reservation.resource.resourceCode}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-slate-700">
                      {reservation.resource.category}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-slate-700">
                      {reservation.resource.location ?? "Not specified"}
                    </td>

                    {/* Start Time */}
                    <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                      {formatDateTime(reservation.startTime)}
                    </td>

                    {/* End Time */}
                    <td className="whitespace-nowrap px-6 py-4 text-slate-700">
                      {formatDateTime(reservation.endTime)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                        Confirmed
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/resources/${reservation.resource.id}`}
                        className="inline-flex whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-xs font-medium text-[#14263D] hover:bg-slate-50"
                      >
                        View Resource
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <p className="text-xs leading-5 text-slate-500">
            Only confirmed bookings are displayed. Pending approval
            requests do not reserve a time slot. Availability is
            verified again when a reservation is submitted.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="h-64 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
