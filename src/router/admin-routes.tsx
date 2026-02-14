import { type RouteObject } from "react-router-dom";
import { RoleGate } from "@/components/auth/role-gate";
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import UsersPage from "@/pages/admin/users";
import SchoolsPage from "@/pages/admin/schools";
import AccountGeneratorPage from "@/pages/admin/tools/account-generator";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: (
    <RoleGate allowedRoles={["admin"]}>
      <AdminLayout />
    </RoleGate>
  ),
  children: [
    {
      index: true,
      element: <AdminDashboard />,
    },
    {
      path: "users",
      element: <UsersPage />,
    },
    {
      path: "exams",
      element: <div className="p-4"><h1>Halaman Manajemen Ujian</h1></div>,
    },
    {
      path: "schools",
      element: <SchoolsPage />,
    },
    {
      path: "settings",
      element: <div className="p-4"><h1>Halaman Pengaturan</h1></div>,
    },
    {
      path: "tools/account-generator",
      element: <AccountGeneratorPage />,
    },
  ],
};
