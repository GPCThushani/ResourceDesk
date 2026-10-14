
import type { Role } from "@prisma/client";

type AppHeaderProps = {
  user: {
    name: string;
    role: Role;
    department: { name: string } | null;
  };
  onMenuClick: () => void;
};

export default function AppHeader({
  user,
  onMenuClick,
}: AppHeaderProps) {
  const roleLabels: Record<Role, string> = {
    EMPLOYEE: "Employee",
    DEPARTMENT_HEAD: "Department Head",
    ADMIN: "Administrator",
  };

  return (
    <header className="flex min-h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 lg:hidden"
        >
          Menu
        </button>

        <div>
          <p className="text-sm font-semibold text-[#14263D]">
            Resource Management
          </p>

          <p className="text-xs text-slate-500">
            {user.department?.name ?? "Organization"}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900">
          {user.name}
        </p>

        <p className="text-xs text-slate-500">
          {roleLabels[user.role]}
        </p>
      </div>
    </header>
  );
}
