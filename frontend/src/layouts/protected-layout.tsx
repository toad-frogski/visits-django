import { useEffect, type FC } from "react";
import MainLayout from "./main-layout";
import { Navigate } from "react-router";
import useAuthStore from "../stores/auth";

const ProtectedLayout: FC = () => {
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, []);

  if (user === undefined) return;

  if (user === null) {
    return <Navigate to="/sign-in" replace />;
  }

  return <MainLayout />;
};

export default ProtectedLayout;
