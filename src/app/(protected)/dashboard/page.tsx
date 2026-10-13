
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import { Suspense } from "react";

async function DashboardContent() {
  await connection();

  const user = await getCurrentUser();

  const resourceVisibility = [
    { accessScope: "ORGANIZATION" as const },
    ...(user.departmentId
      ? [
          {
            accessScope: "DEPARTMENT" as const,
            ownerDepartmentId: user.departmentId,
          },
        ]
      : []),
  ];

  const now = new Date();

  const [
    activeResources,
    myReservations,
    pendingRequests,
    upcomingBookings,
    recentReservations,
  ] = await Promise.all([
    prisma.resource.count({
      where: {
        status: "ACTIVE",
        OR: resourceVisibility,
      },
    }),

    prisma.reservation.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.reservation.count({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    }),

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
        userId: user.id,
      },
      select: {
        id: true,
        bookingReference: true,
        startTime: true,
        endTime: true,
        status: true,
        resource: {
          select: {
            name: true,
            resourceCode: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

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
    {
      label: "Pending Requests",
      value: pendingRequests,
      description: "Awaiting approval",
    },
    {
      label: "Upcoming Bookings",
      value: upcomingBookings,
      description: "Confirmed future bookings",
    },
  ];

  const formatDateTime = (date: Date) =>
    date.toLocaleString("en-GB", {
      timeZone: "Asia/Colombo",
      dateStyle: "medium",
      timeStyle: "short",
    });

  const statusStyles = {
    PENDING: "bg-amber-50 text-amber-800",
    CONFIRMED: "bg-green-50 text-green-800",
    REJECTED: "bg-red-50 text-red-800",
    CANCELLED: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[#14263D]">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Welcome back, {user.name}. Here is your workspace overview.
        </p>
      </section>

      {/* Dashboard statistics */}
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

      {/* Recent reservations */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14263D]">
            Recent Reservations
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your five most recently created reservation requests.
          </p>
        </div>

        {recentReservations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              No reservations found
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Your reservation history will appear here once you
              create your first booking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 font-medium"
                  >
                    Booking Reference
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 font-medium"
                  >
                    Resource
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 font-medium"
                  >
                    Start Time
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 font-medium"
                  >
                    End Time
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-4 font-medium"
                  >
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-[#14263D]">
                      {reservation.bookingReference}
                    </td>

                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">
                        {reservation.resource.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {reservation.resource.resourceCode}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDateTime(reservation.startTime)}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                      {formatDateTime(reservation.endTime)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md px-3 py-1 text-xs font-medium ${
                          statusStyles[reservation.status]
                        }`}
                      >
                        {reservation.status.charAt(0) +
                          reservation.status
                            .slice(1)
                            .toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
