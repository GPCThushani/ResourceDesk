
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/services/current-user";
import EmployeeInviteForm from "@/components/admin/EmployeeInviteForm";

async function EmployeesContent() {
  await connection();

  const currentUser = await getCurrentUser();

  if (currentUser.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [departments, employees] = await Promise.all([
    prisma.department.findMany({
      select: {
        id: true,
        name: true,
        headId: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[#14263D]">
          Employee Management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Invite employees and manage account onboarding.
        </p>
      </div>

      <EmployeeInviteForm departments={departments} />

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-[#14263D]">
            Employee Directory
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {employees.length} registered accounts
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#14263D]">
                      {employee.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {employee.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {employee.employeeId ?? "—"}
                  </td>
                  <td className="px-6 py-4">
                    {employee.department?.name ?? "Administration"}
                  </td>
                  <td className="px-6 py-4">
                    {employee.role.replaceAll("_", " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        employee.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800"
                          : employee.status === "INVITED"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function EmployeesPage() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-slate-500">
          Loading employees...
        </p>
      }
    >
      <EmployeesContent />
    </Suspense>
  );
}
