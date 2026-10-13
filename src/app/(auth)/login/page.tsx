
import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import LoginForm from "@/components/ui/LoginForm";

async function LoginContent() {
  // Authentication requires request-time rendering.
  await connection();

  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Workspace Management
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#14263D]">
            ResourceDesk
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            Sign in to manage workplace resources and reservations.
          </p>
        </div>

        <LoginForm />

        <p className="mt-8 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
          Authorized personnel only
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
          <p className="text-sm text-slate-500">
            Loading ResourceDesk...
          </p>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
