import type { FC } from "react"
import MainLayout from "./main-layout"
import { useSession } from "../contexts/session";
import { Navigate } from "react-router";


const ProtectedLayout: FC = () => {
  const { user } = useSession();

  if (user === null) {
    return <Navigate to={"/sign-in"} replace />
  }

  return <MainLayout />;
};

export default ProtectedLayout;
