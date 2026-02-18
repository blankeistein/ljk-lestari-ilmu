import { type RouteObject } from "react-router-dom";
import { RoleGate } from "@/components/auth/role-gate";
import AdminLayout from "@/components/layout/admin-layout";
import AdminDashboard from "@/pages/admin/dashboard";
import UsersPage from "@/pages/admin/users";
import SchoolsPage from "@/pages/admin/schools";
import ExamsPage from "@/pages/admin/exams";
import ExamDetailPage from "@/pages/admin/exams/detail";
import SettingsPage from "@/pages/admin/settings";
import AccountGeneratorPage from "@/pages/admin/tools/account-generator";
import DummyAnswerGeneratorPage from "@/pages/admin/tools/dummy-answer-generator";
import ErrorReportsPage from "@/pages/admin/error-reports";
import UserLJKPage from "@/pages/admin/users/user-ljk";
import AdminProfilePage from "@/pages/admin/profile";

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
      path: "users/:userId/ljk",
      element: <UserLJKPage />,
    },
    {
      path: "exams",
      element: <ExamsPage />,
    },
    {
      path: "exams/:examsId",
      element: <ExamDetailPage />,
    },
    {
      path: "schools",
      element: <SchoolsPage />,
    },
    {
      path: "error-reports",
      element: <ErrorReportsPage />,
    },
    {
      path: "settings",
      element: <SettingsPage />,
    },
    {
      path: "profile",
      element: <AdminProfilePage />,
    },
    {
      path: "tools/account-generator",
      element: <AccountGeneratorPage />,
    },
    {
      path: "tools/dummy-answer-generator",
      element: <DummyAnswerGeneratorPage />,
    },
  ],
};
