
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ResourceDirectoryItem } from "@/server/services/resources";
import ReservationForm from "./ReservationForm";

type Props = {
  resources: ResourceDirectoryItem[];
};

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#14263D] focus:ring-1 focus:ring-[#14263D]";

export default function QuickReservation({ resources }: Props) {
  const activeResources = useMemo(
    () => resources.filter((resource) => resource.status === "ACTIVE"),
    [resources]
  );

  const categories = useMemo(
    () =>
      [...new Set(activeResources.map((resource) => resource.category))].sort(),
    [activeResources]
  );

  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [resourceId, setResourceId] = useState("");

  const locations = useMemo(() => {
    return [
      ...new Set(
        activeResources
          .filter((resource) => resource.category === category)
          .map((resource) => resource.location?.trim() || "Not specified")
      ),
    ].sort();
  }, [activeResources, category]);

  const matchingResources = useMemo(() => {
    return activeResources.filter(
      (resource) =>
        resource.category === category &&
        (resource.location?.trim() || "Not specified") === location
    );
  }, [activeResources, category, location]);

  const selectedResource = matchingResources.find(
    (resource) => resource.id === resourceId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/reservations"
            className="text-sm font-medium text-slate-600 hover:text-[#14263D]"
          >
            ← My Reservations
          </Link>

          <h1 className="mt-3 text-2xl font-semibold text-[#14263D]">
            New Reservation
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Select a resource and complete your booking in a few steps.
          </p>
        </div>

        <Link
          href="/resources"
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-[#14263D] hover:bg-slate-50"
        >
          Browse Resources
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-[#14263D]">
              1. Select Resource
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Only active resources accessible to your account are listed.
            </p>
          </div>

          <div className="space-y-5 p-6">
            {activeResources.length === 0 ? (
              <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                No active resources are currently available for booking.
              </div>
            ) : (
              <>
                <fieldset>
                  <legend className="mb-3 text-sm font-medium text-slate-700">
                    Resource Category *
                  </legend>

                  <div className="flex flex-wrap gap-3">
                    {categories.map((item) => (
                      <label
                        key={item}
                        className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-3 text-sm ${
                          category === item
                            ? "border-[#14263D] bg-slate-50 text-[#14263D]"
                            : "border-slate-200 text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="resource-category"
                          value={item}
                          checked={category === item}
                          onChange={() => {
                            setCategory(item);
                            setLocation("");
                            setResourceId("");
                          }}
                          className="accent-[#14263D]"
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label
                    htmlFor="quick-location"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Location *
                  </label>

                  <select
                    id="quick-location"
                    value={location}
                    disabled={!category}
                    onChange={(event) => {
                      setLocation(event.target.value);
                      setResourceId("");
                    }}
                    className={inputClass}
                  >
                    <option value="">Select a location</option>
                    {locations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quick-resource"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Resource *
                  </label>

                  <select
                    id="quick-resource"
                    value={resourceId}
                    disabled={!location}
                    onChange={(event) => setResourceId(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a resource</option>
                    {matchingResources.map((resource) => (
                      <option key={resource.id} value={resource.id}>
                        {resource.name} ({resource.resourceCode})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedResource && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h3 className="font-semibold text-[#14263D]">
                      {selectedResource.name}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedResource.resourceCode}
                    </p>

                    <dl className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Location</dt>
                        <dd className="text-right text-slate-800">
                          {selectedResource.location ?? "Not specified"}
                        </dd>
                      </div>

                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Approval</dt>
                        <dd className="text-right font-medium text-slate-800">
                          {selectedResource.requiresApproval
                            ? "Required"
                            : "Not required"}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href={`/resources/${selectedResource.id}`}
                      className="mt-4 inline-block text-sm font-medium text-[#14263D] hover:underline"
                    >
                      View Resource Details →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <div>
          {selectedResource ? (
            <div>
              <p className="mb-3 text-sm font-semibold text-[#14263D]">
                2. Enter Booking Details
              </p>

              <ReservationForm
                key={selectedResource.id}
                resourceId={selectedResource.id}
                resourceName={selectedResource.name}
                requiresApproval={selectedResource.requiresApproval}
              />
            </div>
          ) : (
            <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#14263D]">
                <span className="text-xl">2</span>
              </div>

              <h2 className="mt-4 font-semibold text-[#14263D]">
                Booking Details
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Choose a category, location, and resource to enter your
                reservation date, time, and purpose.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
