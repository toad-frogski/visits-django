import type { FC } from "react";
import { ROUTES } from "@/shared/model/routes";
import { Navigate, Outlet, redirect } from "react-router";
import { useSession } from "@/shared/model/session";

const ProtectedRoute: FC = () => {
  const user = useSession((state) => state.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return <Outlet />;
};

export async function protectedLoader() {
  const { user, fetchUser } = useSession.getState();
  await fetchUser();

  if (!user) {
    return redirect(ROUTES.LOGIN);
  }

  return null;
}

export default ProtectedRoute;
