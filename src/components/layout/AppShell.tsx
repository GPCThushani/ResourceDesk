
"use client";

import { useState } from "react";
import type { Role } from "@prisma/client";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

type ShellUser = {
  name: string;
  role: Role;
  department: {
    name: string;
  } | null;
};

type AppShellProps = {
  user: ShellUser;
  children: React.ReactNode;
};

export default function AppShell({
  user,
  children,
}: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <AppSidebar
        role={user.role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <AppHeader
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
