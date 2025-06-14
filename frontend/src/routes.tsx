import { createBrowserRouter, Navigate } from "react-router";
import ProtectedLayout from "@/layouts/protected-layout";
import SignIn from "@/pages/sign-in";
import Dashboard from "@/pages/dashboard";
import List from "@/pages/list";
import DashboardGeneral from "@/pages/dashboard/general";
import Profile from "@/pages/profile";
import DashboardReport from "@/pages/dashboard/report";

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
