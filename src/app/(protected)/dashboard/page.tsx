
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logout } from "@/server/actions/auth";
import { connection } from "next/server";
export const instant = false;

export default async function DashboardPage() {
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      department: {
        select: { name: true },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [resourceCount, reservationCount] = await Promise.all([
    prisma.resource.count({
      where: { status: "ACTIVE" },
    }),
    prisma.reservation.count({
      where: { userId: session.user.id },
    }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">ResourceDesk Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#14263D]">
            Dashboard
          </h1>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </header>

      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome, {user.name}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {user.email}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Role: {user.role.replaceAll("_", " ")}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Department: {user.department?.name ?? "Not assigned"}
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            Active resources (organization-wide)
          </p>
          <p className="mt-3 text-3xl font-semibold text-[#14263D]">
            {resourceCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">My reservations</p>
          <p className="mt-3 text-3xl font-semibold text-[#14263D]">
            {reservationCount}
          </p>
        </div>
      </section>
    </main>
  );
}
