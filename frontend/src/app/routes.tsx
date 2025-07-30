import { createBrowserRouter, redirect } from "react-router-dom";
import App from "@/app/app";
import { ROUTES } from "@/shared/model/routes";
import Providers from "@/app/providers";
import ProtectedRoute, { userLoader } from "@/app/protected-route";
import AdminRoute from "@/app/admin-route";

const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        loader: userLoader,
        element: <ProtectedRoute />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            lazy: () => import("@/features/dashboard/dashboard.page"),
          },
          {
            path: ROUTES.SETTINGS,
            lazy: () => import("@/features/settings/settings.page"),
          },
        ],
      },
      {
        loader: userLoader,
        element: <AdminRoute />,
        children: [
          {
            path: ROUTES.ADMIN_REPORTS,
            lazy: () => import("@/features/admin-reports/admin-reports.page"),
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
