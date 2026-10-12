
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function HomePage() {
  await connection();

  const session = await auth();

  redirect(session?.user ? "/dashboard" : "/login");
}
