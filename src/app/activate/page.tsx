
import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { findValidActivation } from "@/server/services/invitations";
import ActivationForm from "@/components/auth/ActivationForm";

type PageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

async function ActivationContent({
  searchParams,
}: PageProps) {
  await connection();

  const params = await searchParams;
  const token =
    typeof params.token === "string" ? params.token : "";

  const activation = token
    ? await findValidActivation(token)
    : null;

  if (!activation) {
    return (
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[#14263D]">
          Activation Link Unavailable
        </h1>

        <p className="mt-4 text-sm text-slate-600">
          This invitation is invalid, expired, or has already
          been used. Contact your administrator to request
          another invitation.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex rounded-md bg-[#14263D] px-5 py-3 text-sm text-white"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <ActivationForm
      token={token}
      email={activation.user.email}
      employeeId={activation.user.employeeId}
      department={
        activation.user.department?.name ?? "Not assigned"
      }
      role={activation.user.role}
    />
  );
}

export default function ActivatePage(props: PageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <Suspense
        fallback={
          <p className="text-sm text-slate-500">
            Checking invitation...
          </p>
        }
      >
        <ActivationContent {...props} />
      </Suspense>
    </main>
  );
}
