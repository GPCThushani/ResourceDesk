
import { Suspense } from "react";
import { connection } from "next/server";

import AppShell from "@/components/layout/AppShell";
import { getCurrentUser } from "@/server/services/current-user";

async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  const user = await getCurrentUser();

  return (
    <AppShell
      user={{
        name: user.name,
        role: user.role,
        department: user.department
          ? { name: user.department.name }
          : null,
      }}
    >
      {children}
    </AppShell>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA]">
          <p className="text-sm text-slate-500">
            Loading workspace...
          </p>
        </div>
      }
    >
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </Suspense>
  );
}
