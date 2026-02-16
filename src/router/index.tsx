import { createBrowserRouter } from "react-router-dom";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import NotFoundPage from "@/pages/errors/not-found";
import ServerErrorPage from "@/pages/errors/server-error";
import { adminRoutes } from "./admin-routes";
import { headmasterRoutes } from "./headmaster-routes";
import { userRoutes } from "./user-routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <ServerErrorPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
    errorElement: <ServerErrorPage />,
  },

  // Feature Routes
  {
    ...adminRoutes,
    errorElement: <ServerErrorPage />,
  },
  {
    ...headmasterRoutes,
    errorElement: <ServerErrorPage />,
  },
  {
    ...userRoutes,
    errorElement: <ServerErrorPage />,
  },

  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
