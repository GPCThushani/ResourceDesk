
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@prisma/client";

import { logout } from "@/server/actions/auth";

type NavigationItem = {
  label: string;
  href: string;
  roles?: Role[];
};

const navigation: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Resources",
    href: "/resources",
  },
  {
    label: "My Reservations",
    href: "/reservations",
  },
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
{
  label: "Employee Management",
  href: "/admin/employees",
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
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#14263D] text-white transition-transform lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
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

        {/* Navigation */}
        <nav
          aria-label="Main navigation"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-6"
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

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-white/10 px-3 py-4">
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-md px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {/* Logout Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>

              <span>Sign Out</span>
            </button>
          </form>

          <p className="mt-3 px-4 text-xs text-slate-400">
            Internal Workspace
          </p>
        </div>
      </aside>
    </>
  );
}
