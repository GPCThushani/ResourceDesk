
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createResource,
  updateResource,
} from "@/server/actions/resources";
import type { ResourceInput } from "@/validations/resource";

type Resource = {
  id: string;
  resourceCode: string;
  name: string;
  category: string;
  description: string | null;
  location: string | null;
  capacity: number | null;
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE";
  accessScope: "ORGANIZATION" | "DEPARTMENT";
  requiresApproval: boolean;
  ownerDepartmentId: string | null;
  ownerDepartment: { name: string } | null;
};

type Department = {
  id: string;
  name: string;
  departmentCode: string;
};

type Props = {
  resources: Resource[];
  departments: Department[];
};

type FormState = {
  resourceCode: string;
  name: string;
  category: string;
  description: string;
  location: string;
  capacity: string;
  status: Resource["status"];
  accessScope: Resource["accessScope"];
  requiresApproval: boolean;
  ownerDepartmentId: string;
};

const emptyForm: FormState = {
  resourceCode: "",
  name: "",
  category: "",
  description: "",
  location: "",
  capacity: "",
  status: "ACTIVE",
  accessScope: "ORGANIZATION",
  requiresApproval: false,
  ownerDepartmentId: "",
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#14263D] focus:ring-1 focus:ring-[#14263D]";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700";

export default function AdminResourceManager({
  resources,
  departments,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const filteredResources = resources.filter((resource) =>
    [
      resource.name,
      resource.resourceCode,
      resource.category,
      resource.location ?? "",
    ].some((value) =>
      value.toLowerCase().includes(search.trim().toLowerCase())
    )
  );

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setFeedback(null);
    setShowForm(true);
  }

  function openEdit(resource: Resource) {
    setEditingId(resource.id);
    setForm({
      resourceCode: resource.resourceCode,
      name: resource.name,
      category: resource.category,
      description: resource.description ?? "",
      location: resource.location ?? "",
      capacity:
        resource.capacity === null
          ? ""
          : String(resource.capacity),
      status: resource.status,
      accessScope: resource.accessScope,
      requiresApproval: resource.requiresApproval,
      ownerDepartmentId: resource.ownerDepartmentId ?? "",
    });
    setFeedback(null);
    setShowForm(true);
  }

  function closeForm() {
    if (isPending) return;
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFeedback(null);

    const capacityText = form.capacity.trim();

    const capacity =
      capacityText === "" ? null : Number(capacityText);

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || capacity <= 0)
    ) {
      setFeedback({
        success: false,
        message: "Capacity must be a positive whole number.",
      });
      return;
    }

    const input: ResourceInput = {
      resourceCode: form.resourceCode,
      name: form.name,
      category: form.category,
      description: form.description,
      location: form.location,
      capacity,
      status: form.status,
      accessScope: form.accessScope,
      requiresApproval: form.requiresApproval,
      ownerDepartmentId: form.ownerDepartmentId || null,
    };

    startTransition(async () => {
      const result = editingId
        ? await updateResource(editingId, input)
        : await createResource(input);

      setFeedback(result);

      if (result.success) {
        setShowForm(false);
        setEditingId(null);
        setForm({ ...emptyForm });
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#14263D]">
            Resource Management
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Create and maintain workplace resources and their
            booking policies.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-[#14263D] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#223D5C]"
        >
          + Add Resource
        </button>
      </div>

      {feedback && (
        <div
          role={feedback.success ? "status" : "alert"}
          className={`rounded-md border px-4 py-3 text-sm ${
            feedback.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {showForm && (
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-[#14263D]">
              {editingId ? "Edit Resource" : "Add New Resource"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              disabled={isPending}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="resource-code" className={labelClass}>
                  Resource Code *
                </label>
                <input
                  id="resource-code"
                  required
                  maxLength={40}
                  className={inputClass}
                  value={form.resourceCode}
                  onChange={(e) =>
                    updateField("resourceCode", e.target.value)
                  }
                  placeholder="ROOM-003"
                />
              </div>

              <div>
                <label htmlFor="resource-name" className={labelClass}>
                  Resource Name *
                </label>
                <input
                  id="resource-name"
                  required
                  minLength={2}
                  maxLength={120}
                  className={inputClass}
                  value={form.name}
                  onChange={(e) =>
                    updateField("name", e.target.value)
                  }
                  placeholder="Meeting Room"
                />
              </div>

              <div>
                <label htmlFor="resource-category" className={labelClass}>
                  Category *
                </label>
                <input
                  id="resource-category"
                  required
                  minLength={2}
                  maxLength={80}
                  className={inputClass}
                  value={form.category}
                  onChange={(e) =>
                    updateField("category", e.target.value)
                  }
                  placeholder="Meeting Room, Equipment..."
                />
              </div>

              <div>
                <label htmlFor="resource-location" className={labelClass}>
                  Location
                </label>
                <input
                  id="resource-location"
                  maxLength={150}
                  className={inputClass}
                  value={form.location}
                  onChange={(e) =>
                    updateField("location", e.target.value)
                  }
                  placeholder="Building A, Floor 2"
                />
              </div>

              <div>
                <label htmlFor="resource-capacity" className={labelClass}>
                  Capacity (optional)
                </label>
                <input
                  id="resource-capacity"
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) =>
                    updateField("capacity", e.target.value)
                  }
                  placeholder="20"
                />
              </div>

              <div>
                <label htmlFor="resource-status" className={labelClass}>
                  Status
                </label>
                <select
                  id="resource-status"
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    updateField(
                      "status",
                      e.target.value as FormState["status"]
                    )
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div>
                <label htmlFor="resource-scope" className={labelClass}>
                  Access Scope
                </label>
                <select
                  id="resource-scope"
                  className={inputClass}
                  value={form.accessScope}
                  onChange={(e) =>
                    updateField(
                      "accessScope",
                      e.target.value as FormState["accessScope"]
                    )
                  }
                >
                  <option value="ORGANIZATION">
                    Organization-wide
                  </option>
                  <option value="DEPARTMENT">
                    Department only
                  </option>
                </select>
              </div>

              <div>
                <label htmlFor="resource-department" className={labelClass}>
                  Owning Department
                  {form.accessScope === "DEPARTMENT" ? " *" : ""}
                </label>
                <select
                  id="resource-department"
                  className={inputClass}
                  required={form.accessScope === "DEPARTMENT"}
                  value={form.ownerDepartmentId}
                  onChange={(e) =>
                    updateField("ownerDepartmentId", e.target.value)
                  }
                >
                  <option value="">No department assigned</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name} ({department.departmentCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="resource-description" className={labelClass}>
                Description
              </label>
              <textarea
                id="resource-description"
                rows={3}
                maxLength={1000}
                className={inputClass}
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Describe this resource..."
              />
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={form.requiresApproval}
                onChange={(e) =>
                  updateField("requiresApproval", e.target.checked)
                }
                className="mt-1 h-4 w-4 accent-[#14263D]"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">
                  Require approval before confirming reservations
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Requests will need review by the designated department head.
                </span>
              </span>
            </label>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-[#14263D] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              >
                {isPending
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Create Resource"}
              </button>

              <button
                type="button"
                onClick={closeForm}
                disabled={isPending}
                className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h2 className="font-semibold text-[#14263D]">
              All Resources
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredResources.length} of {resources.length} resources
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            aria-label="Search resources"
            className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">
                  Resource
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Category
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Department
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Status
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
              {filteredResources.map((resource) => (
                <tr
                  key={resource.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#14263D]">
                      {resource.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {resource.resourceCode}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {resource.category}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {resource.ownerDepartment?.name ?? "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-medium ${
                        resource.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-800"
                          : resource.status === "MAINTENANCE"
                            ? "bg-amber-50 text-amber-800"
                            : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {resource.status === "ACTIVE"
                        ? "Active"
                        : resource.status === "MAINTENANCE"
                          ? "Maintenance"
                          : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {resource.accessScope === "ORGANIZATION"
                      ? "Organization"
                      : "Department"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openEdit(resource)}
                        className="font-medium text-[#14263D] hover:underline"
                      >
                        Edit
                      </button>

                      <Link
                        href={`/resources/${resource.id}`}
                        className="text-slate-600 hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredResources.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No resources found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
