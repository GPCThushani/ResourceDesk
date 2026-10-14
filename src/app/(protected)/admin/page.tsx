
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentUser } from "@/server/services/current-user";

export default async function AdminPage() {
  await connection();

  const user = await getCurrentUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  redirect("/admin/resources");
}
