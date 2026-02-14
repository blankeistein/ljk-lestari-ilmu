import { type RouteObject, Outlet } from "react-router-dom";
import { RoleGate } from "@/components/auth/role-gate";
import { Dashboard } from "@/pages/placeholders";

export const userRoutes: RouteObject = {
  path: "/dashboard",
  element: (
    <RoleGate allowedRoles={["user", "teacher"]}>
      {/* Placeholder for User Layout */}
      <div className="min-h-screen bg-background">
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="font-bold">Panel User</h1>
          {/* Logout button can be added here */}
        </header>
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </RoleGate>
  ),
  children: [
    {
      index: true,
      element: <Dashboard />,
    },
    {
      path: "profile",
      element: <div className="p-4"><h1>Profil Saya</h1></div>,
    },
  ],
};
