
"use client";

import { useState, useTransition } from "react";
import { inviteEmployee } from "@/server/actions/employee-invitations";

type Department = {
  id: string;
  name: string;
  headId: string | null;
};

export default function EmployeeInviteForm({
  departments,
}: {
  departments: Department[];
}) {
  const [email, setEmail] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState(
    departments[0]?.id ?? ""
  );
  const [role, setRole] = useState<
    "EMPLOYEE" | "DEPARTMENT_HEAD"
  >("EMPLOYEE");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    startTransition(async () => {
      const result = await inviteEmployee({
        email,
        employeeId,
        departmentId,
        role,
      });

      setSuccess(result.success);
      setMessage(result.message);

      if (result.success) {
        setEmail("");
        setEmployeeId("");
      }
    });
  }

  const inputClass =
    "mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#14263D]";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-[#14263D]">
        Invite New Employee
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Employees will receive an email to activate their
        accounts and create their own passwords.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Official Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="employee@company.com"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Employee ID
            <input
              required
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              placeholder="ENG-003"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Department
            <select
              required
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className={inputClass}
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Role
            <select
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value as
                    | "EMPLOYEE"
                    | "DEPARTMENT_HEAD"
                )
              }
              className={inputClass}
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="DEPARTMENT_HEAD">
                Department Head
              </option>
            </select>
          </label>
        </div>

        {message && (
          <p
            role="status"
            className={`rounded-md px-4 py-3 text-sm ${
              success
                ? "bg-emerald-50 text-emerald-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending || departments.length === 0}
          className="rounded-md bg-[#14263D] px-6 py-3 text-sm font-medium text-white hover:bg-[#223D5C] disabled:opacity-50"
        >
          {pending ? "Sending Invitation..." : "Send Invitation"}
        </button>
      </form>
    </section>
  );
}
