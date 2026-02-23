import { type RouteObject, Outlet } from "react-router-dom";
import { RoleGate } from "@/components/auth/role-gate";
import UserLayout from "@/components/layout/user-layout";
import Dashboard from "@/pages/dashboard";
import SetSchoolPage from "@/pages/headmaster/set-school";
import ScanHistoryPage from "@/pages/dashboard/history";
import ScanHistoryDetailPage from "@/pages/dashboard/history-detail";
import ProfilePage from "@/pages/dashboard/profile";

export const userRoutes: RouteObject = {
  path: "/dashboard",
  element: (
    <RoleGate allowedRoles={["user", "teacher"]}>
      <UserLayout>
        <Outlet />
      </UserLayout>
    </RoleGate>
  ),
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: "profile",
      element: <ProfilePage />,
    },
    {
      path: "history",
      element: <ScanHistoryPage />,
    },
    {
      path: "history/:examId/:gradeId/:subjectId",
      element: <ScanHistoryDetailPage />,
    },
    {
      path: "set-school",
      element: <SetSchoolPage />,
    },
  ],
};
