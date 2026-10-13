import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { getDailyAttendanceAnalytics } from "@/lib/dailyAnalyticsActions";
import DailyAnalyticsClient from "./DailyAnalyticsClient";

export const dynamic = "force-dynamic";

export default async function DayAnalyticsPage() {
  const session = await getCurrentSession();
  const isSuperAdminUser = session?.roles.includes("SUPER_ADMIN");
  const isOfficeUser = session?.roles.includes("OFFICE");
  const isAcademicAdminUser =
    session?.roles.includes("ACADEMIC_ADMIN") || session?.roles.includes("DEAN");

  if (!session || (!isSuperAdminUser && !isOfficeUser && !isAcademicAdminUser)) {
    redirect("/dashboard");
  }

  const initialData = await getDailyAttendanceAnalytics();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <DailyAnalyticsClient initialData={initialData} />
    </div>
  );
}
