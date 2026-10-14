
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { activateAccount } from "@/server/actions/activate-account";

type Props = {
  token: string;
  email: string;
  employeeId: string | null;
  department: string;
  role: string;
};

export default function ActivationForm({
  token,
  email,
  employeeId,
  department,
  role,
}: Props) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const result = await activateAccount({
        token,
        name,
        password,
        confirmPassword,
      });

      setMessage(result.message);
      setSuccess(result.success);

      if (result.success) {
        setPassword("");
        setConfirmPassword("");
      }
    });
  }

  const inputClass =
    "mt-2 w-full rounded-md border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#14263D]";

  return (
    <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Workspace Management
      </p>

      <h1 className="mt-3 text-3xl font-semibold text-[#14263D]">
        Activate Your Account
      </h1>

      <p className="mt-3 text-sm text-slate-600">
        Welcome to ResourceDesk. Confirm your details and
        create a password to get started.
      </p>

      <div className="mt-6 space-y-3 rounded-lg bg-slate-50 p-5 text-sm">
        <p>
          <span className="text-slate-500">Email: </span>
          <span className="font-medium">{email}</span>
        </p>
        <p>
          <span className="text-slate-500">Employee ID: </span>
          <span className="font-medium">
            {employeeId ?? "Not assigned"}
          </span>
        </p>
        <p>
          <span className="text-slate-500">Department: </span>
          <span className="font-medium">{department}</span>
        </p>
        <p>
          <span className="text-slate-500">Role: </span>
          <span className="font-medium">
            {role.replaceAll("_", " ")}
          </span>
        </p>
      </div>

      {success ? (
        <div className="mt-6 space-y-4">
          <p
            role="status"
            className="rounded-md bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {message}
          </p>

          <Link
            href="/login"
            className="inline-flex rounded-md bg-[#14263D] px-5 py-3 text-sm font-medium text-white"
          >
            Continue to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Full Name
            <input
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Create Password
            <input
              type="password"
              required
              minLength={12}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 12 characters"
              className={inputClass}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Confirm Password
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              className={inputClass}
            />
          </label>

          {message && (
            <p
              role="alert"
              className="rounded-md bg-red-50 p-3 text-sm text-red-700"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-[#14263D] px-5 py-3 text-sm font-medium text-white hover:bg-[#223D5C] disabled:opacity-50"
          >
            {pending ? "Activating..." : "Activate Account"}
          </button>
        </form>
      )}
    </div>
  );
}
