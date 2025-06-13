import { type FC } from "react";
import MainLayout from "./main-layout";
import { Navigate } from "react-router";
import useAuthStore from "../stores/auth";

const ProtectedLayout: FC = () => {
  // const { user, loading } = useAuth();
  const user = useAuthStore((state) => state.user);

  if (user === undefined) return;

  if (user === null) {
    return <Navigate to="/sign-in" replace />;
  }

  return <MainLayout />;
};

export default ProtectedLayout;
