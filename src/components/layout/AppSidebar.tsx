
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

type NavigationItem = {
  label: string;
  href: string;
  roles?: Role[];
};

const navigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Resources", href: "/resources" },
  { label: "My Reservations", href: "/reservations" },
  {
    label: "Approvals",
    href: "/approvals",
    roles: ["DEPARTMENT_HEAD", "ADMIN"],
  },
  {
    label: "Administration",
    href: "/admin",
    roles: ["ADMIN"],
  },
];

type AppSidebarProps = {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
};

export default function AppSidebar({
  role,
  isOpen,
  onClose,
}: AppSidebarProps) {
  const pathname = usePathname();

  const visibleNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#14263D] text-white transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-7">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="text-xl font-semibold tracking-tight"
          >
            ResourceDesk
          </Link>
          <p className="mt-1 text-xs text-slate-400">
            Resource Management System
          </p>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex-1 space-y-1 px-3 py-6"
        >
          {visibleNavigation.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`block rounded-md px-4 py-3 text-sm transition ${
                  active
                    ? "bg-white/15 font-semibold text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs text-slate-400">
            Internal Workspace
          </p>
        </div>
      </aside>
    </>
  );
}
