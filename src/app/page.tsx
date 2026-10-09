import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import LoginPage from "./login/page";

export default async function HomePage() {
  const session = await getCurrentSession();
  if (session) {
    redirect("/dashboard");
  }
  return <LoginPage />;
}
