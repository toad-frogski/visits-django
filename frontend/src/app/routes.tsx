import { createBrowserRouter, redirect } from "react-router-dom";
import App from "@/app/app";
import { ROUTES } from "@/shared/model/routes";
import Providers from "@/app/providers";
import ProtectedRoute, { protectedLoader } from "@/app/protected-route";
import { Component as DashboardPage } from "@/features/dashboard/dashboard.page";

const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        loader: protectedLoader,
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            // lazy: () => import("@/features/dashboard/dashboard.page"),
            Component: DashboardPage,
          },
          {
            path: ROUTES.SETTINGS,
            lazy: () => import("@/features/settings/settings.page"),
          },
        ],
      },
      {
        path: ROUTES.USERS,
        lazy: () => import("@/features/user-list/user-list.page"),
      },
      {
        path: ROUTES.LOGIN,
        lazy: () => import("@/features/auth/login.page"),
      },
      {
        path: "*",
        loader: () => redirect(ROUTES.USERS),
      },
    ],
  },
]);

export default router;
