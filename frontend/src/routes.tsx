import { createBrowserRouter, Navigate } from "react-router";
import ProtectedLayout from "./layouts/protected-layout";
import SignIn from "./pages/sign-in";
import Home from "./pages/home";
import List from "./pages/list";
import Visits from "./pages/home/visits";

const router = createBrowserRouter([
  {
    path: "/", element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to={"/home"} replace /> },
      {
        path: "home", element: <Home />,
        children: [
          { index: true, element: <Visits /> },
        ]
      },
      { path: "list", element: <List /> },
    ],
  },
  { path: "/sign-in", element: <SignIn /> },
  { path: "*", element: <Navigate to="/home" replace /> },
]);

export default router
