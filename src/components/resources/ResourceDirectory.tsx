
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ResourceDirectoryItem } from "@/server/services/resources";

type ResourceDirectoryProps = {
  resources: ResourceDirectoryItem[];
};

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

export default function ResourceDirectory({
  resources,
}: ResourceDirectoryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  // Categories are dynamically generated from database records.
  const categories = useMemo(() => {
    return [
      ...new Set(resources.map((resource) => resource.category)),
    ].sort();
  }, [resources]);

  // Filter resources using search, category, and status.
  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((resource) => {
      const searchableValues = [
        resource.name,
        resource.resourceCode,
        resource.category,
        resource.location ?? "",
        resource.description ?? "",
      ];

      const matchesSearch =
        query.length === 0 ||
        searchableValues.some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesCategory =
        category === "ALL" || resource.category === category;

      const matchesStatus =
        status === "ALL" || resource.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [resources, search, category, status]);

  function clearFilters() {
    setSearch("");
    setCategory("ALL");
    setStatus("ALL");
  }

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#14263D]">
            Resources
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Browse workplace resources, check their status, and review
            booking requirements.
          </p>
        </div>

        <Link
          href="/reservations/new"
          className="inline-flex items-center rounded-md bg-[#14263D] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#223D5C]"
        >
          + New Reservation
        </Link>
      </section>

      {/* Main Directory */}
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        {/* Search and Filters */}
        <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[1fr_200px_180px]">
          {/* Search */}
          <div>
            <label
              htmlFor="resource-search"
              className="mb-2 block text-xs font-medium text-slate-600"
            >
              Search Resources
            </label>

            <input
              id="resource-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, code, category, or location"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#14263D] focus:ring-1 focus:ring-[#14263D]"
            />
          </div>

          {/* Category Filter */}
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#14263D]"
            >
              <option value="ALL">All categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
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
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#14263D]"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Result Count */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
          <p className="text-sm text-slate-600">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredResources.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {resources.length}
            </span>{" "}
            resources
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-[#14263D] hover:underline"
          >
            Clear Filters
          </button>
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 ? (
          <div className="border-t border-slate-200 px-6 py-16 text-center">
            <h2 className="text-base font-semibold text-[#14263D]">
              No matching resources found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or selecting different filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-[#14263D] hover:bg-slate-50"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Resource Table */
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

                  <th scope="col" className="px-5 py-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredResources.map((resource) => {
                  const isBookable =
                    resource.status === "ACTIVE";

                  return (
                    <tr
                      key={resource.id}
                      className="border-b border-slate-100 align-top transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      {/* Resource Name and Description */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/resources/${resource.id}`}
                          className="font-semibold text-[#14263D] hover:underline"
                        >
                          {resource.name}
                        </Link>

                        <p className="mt-1 text-xs text-slate-500">
                          {resource.resourceCode}
                        </p>

                        {resource.description && (
                          <p className="mt-2 max-w-xs text-xs leading-5 text-slate-500">
                            {resource.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-slate-700">
                        {resource.category}
                      </td>

                      {/* Location and Capacity */}
                      <td className="px-5 py-4 text-slate-700">
                        <span>
                          {resource.location ?? "Not specified"}
                        </span>

                        {resource.capacity !== null && (
                          <p className="mt-1 text-xs text-slate-500">
                            Capacity: {resource.capacity}
                          </p>
                        )}
                      </td>

                      {/* Resource Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${
                            statusStyles[resource.status]
                          }`}
                        >
                          {statusLabels[resource.status]}
                        </span>
                      </td>

                      {/* Booking Requirements */}
                      <td className="px-5 py-4">
                        {isBookable ? (
                          resource.requiresApproval ? (
                            <span className="text-sm text-slate-700">
                              Approval required
                            </span>
                          ) : (
                            <span className="text-sm text-slate-700">
                              No approval required
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-slate-500">
                            Not bookable
                          </span>
                        )}
                      </td>

                      {/* Access Scope */}
                      <td className="px-5 py-4 text-slate-700">
                        {resource.accessScope === "ORGANIZATION"
                          ? "Organization"
                          : resource.ownerDepartment?.name ??
                            "Department"}
                      </td>

                      {/* Resource Actions */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/resources/${resource.id}`}
                          className="inline-flex whitespace-nowrap rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-[#14263D] transition hover:border-[#14263D] hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
