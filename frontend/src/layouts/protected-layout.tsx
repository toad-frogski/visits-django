import { type FC } from "react";
import MainLayout from "./main-layout";
import { useAuth } from "../contexts/auth";
import { Navigate } from "react-router";

const ProtectedLayout: FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return null;
  }

  if (user === null) {
    return <Navigate to="/sign-in" replace />;
  }

  return <MainLayout />;
};

export default ProtectedLayout;
