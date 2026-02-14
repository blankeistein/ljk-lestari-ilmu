import { type RouteObject } from "react-router-dom";
import { RoleGate } from "@/components/auth/role-gate";
import AdminLayout from "@/components/layout/admin-layout";

export const headmasterRoutes: RouteObject = {
  path: "/headmaster",
  element: (
    <RoleGate allowedRoles={["headmaster"]}>
      <AdminLayout /> {/* Temporary using AdminLayout */}
    </RoleGate>
  ),
  children: [
    {
      index: true,
      element: <div className="p-4"><h1>Dashboard Kepala Sekolah</h1></div>,
    },
    {
      path: "reports",
      element: <div className="p-4"><h1>Laporan Hasil Ujian</h1></div>,
    },
  ],
};
