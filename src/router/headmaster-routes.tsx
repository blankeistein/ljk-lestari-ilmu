import { type RouteObject } from "react-router-dom";
import { RoleGate } from "@/components/auth/role-gate";
import HeadmasterLayout from "@/components/layout/headmaster-layout";
import SetSchoolPage from "@/pages/headmaster/set-school";
import HeadmasterProfilePage from "@/pages/headmaster/profile";
import HeadmasterDashboard from "@/pages/headmaster/dashboard";
import HeadmasterUsersPage from "@/pages/headmaster/users";

export const headmasterRoutes: RouteObject = {
  path: "/headmaster",
  element: (
    <RoleGate allowedRoles={["headmaster"]}>
      <HeadmasterLayout />
    </RoleGate>
  ),
  children: [
    {
      index: true,
      element: <HeadmasterDashboard />,
    },
    {
      path: "reports",
      element: <div className="p-4"><h1>Laporan Hasil Ujian</h1></div>,
    },
    {
      path: "users",
      element: <HeadmasterUsersPage />,
    },
    {
      path: "profile",
      element: <HeadmasterProfilePage />,
    },
    {
      path: "set-school",
      element: <SetSchoolPage />,
    },
  ],
};
