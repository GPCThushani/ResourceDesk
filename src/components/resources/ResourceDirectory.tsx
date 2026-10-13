
"use client";

import { useMemo, useState } from "react";
import type { ResourceDirectoryItem } from "@/server/services/resources";

type ResourceDirectoryProps = {
  resources: ResourceDirectoryItem[];
};

export default function ResourceDirectory({
  resources,
}: ResourceDirectoryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const categories = useMemo(
    () => [...new Set(resources.map((resource) => resource.category))].sort(),
    [resources]
  );

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesSearch =
        !query ||
        [
          resource.name,
          resource.resourceCode,
          resource.category,
          resource.location ?? "",
          resource.description ?? "",
        ].some((value) => value.toLowerCase().includes(query));

      const matchesCategory =
        category === "ALL" || resource.category === category;

      const matchesStatus =
        status === "ALL" || resource.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [resources, search, category, status]);

  const statusStyles = {
    ACTIVE: "bg-emerald-50 text-emerald-800",
    MAINTENANCE: "bg-amber-50 text-amber-800",
    INACTIVE: "bg-slate-100 text-slate-600",
  };

  const statusLabels = {
    ACTIVE: "Active",
    MAINTENANCE: "Maintenance",
    INACTIVE: "Inactive",
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight text-[#14263D]">
          Resources
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse workplace resources and review their booking requirements.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[1fr_200px_180px]">
          <div>
            <label
              htmlFor="resource-search"
              className="mb-2 block text-xs font-medium text-slate-600"
            >
              Search resources
            </label>
            <input
              id="resource-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, code, category, or location"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#14263D]"
            />
          </div>

          <div>
            <label
              htmlFor="resource-category"
              className="mb-2 block text-xs font-medium text-slate-600"
            >
              Category
            </label>
            <select
              id="resource-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="ALL">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="resource-status"
              className="mb-2 block text-xs font-medium text-slate-600"
            >
              Status
            </label>
            <select
              id="resource-status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredResources.length}
            </span>{" "}
            of {resources.length} resources
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("ALL");
              setStatus("ALL");
            }}
            className="text-sm font-medium text-[#14263D] hover:underline"
          >
            Clear filters
          </button>
        </div>

        {filteredResources.length === 0 ? (
          <div className="border-t border-slate-200 px-6 py-16 text-center">
            <p className="font-medium text-slate-800">
              No matching resources found
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Resource
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Location
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Booking
                  </th>
                  <th scope="col" className="px-5 py-4 font-medium">
                    Access
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResources.map((resource) => (
                  <tr
                    key={resource.id}
                    className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#14263D]">
                        {resource.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {resource.resourceCode}
                      </p>
                      {resource.description && (
                        <p className="mt-2 max-w-xs text-xs text-slate-500">
                          {resource.description}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {resource.category}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {resource.location ?? "Not specified"}
                      {resource.capacity !== null && (
                        <p className="mt-1 text-xs text-slate-500">
                          Capacity: {resource.capacity}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                          statusStyles[resource.status]
                        }`}
                      >
                        {statusLabels[resource.status]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {resource.status !== "ACTIVE"
                        ? "Not bookable"
                        : resource.requiresApproval
                          ? "Approval required"
                          : "No approval required"}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {resource.accessScope === "ORGANIZATION"
                        ? "Organization"
                        : resource.ownerDepartment?.name ??
                          "Department"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
