
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Wait for a real request before accessing authentication.
  await connection();

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      status: true,
    },
  });

  if (!user || user.status !== "ACTIVE") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {children}
    </div>
  );
}
