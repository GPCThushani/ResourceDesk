
import { Suspense } from "react";
import { connection } from "next/server";

import ResourceDirectory from "@/components/resources/ResourceDirectory";
import { getAccessibleResources } from "@/server/services/resources";

async function ResourcesContent() {
  await connection();

  const resources = await getAccessibleResources();

  return <ResourceDirectory resources={resources} />;
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-80 max-w-full animate-pulse rounded bg-slate-200" />
          <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  );
}
