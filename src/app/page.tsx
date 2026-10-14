
import { JSX, Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

async function HomeContent(): Promise<JSX.Element | null> {
  await connection();

  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  redirect("/login");

  return null;
}

export default function HomePage() {
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
      <HomeContent />
    </Suspense>
  );
}
