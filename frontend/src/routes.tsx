import { createBrowserRouter, Navigate } from "react-router";
import ProtectedLayout from "@/layouts/protected-layout";
import { lazy } from "react";

const SignIn = lazy(() => import("@/pages/sign-in"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const List = lazy(() => import("@/pages/list"));
const DashboardGeneral = lazy(() => import("@/pages/dashboard/general"));
const Profile = lazy(() => import("@/pages/profile"));
const DashboardReport = lazy(() => import("@/pages/dashboard/report"));

const router = createBrowserRouter([
  {
    path: "",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to={"dashboard"} replace /> },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          { index: true, element: <Navigate to={"general"} replace /> },
          { path: "general", element: <DashboardGeneral /> },
          { path: "report", element: <DashboardReport /> },
        ],
      },
      { path: "users", element: <List /> },
      { path: "profile", element: <Profile /> },
    ],
  },
  { path: "sign-in", element: <SignIn /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
