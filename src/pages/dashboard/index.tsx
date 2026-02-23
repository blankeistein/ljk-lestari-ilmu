import { useAuth } from "@/hooks/auth-context";
import TeacherDashboard from "./teacher-dashboard";
import { Dashboard as DefaultDashboard } from "../placeholders";

export default function DashboardRouter() {
  const { profile } = useAuth();

  if (profile?.role === "teacher") {
    return <TeacherDashboard />;
  }

  // Fallback to default dashboard for other roles (e.g., "user")
  return <DefaultDashboard />;
}
