import type { FC } from "react";
import { Navigate, Outlet} from "react-router-dom";
import { useSession } from "@/shared/model/session";
import { ROUTES } from "@/shared/model/routes";


const AdminRoute: FC = () => {
  const user = useSession((state) => state.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  if (!user.is_superuser) {
    return <Navigate to={ROUTES.USERS} />;
  }

  return <Outlet />;
};

export default AdminRoute;
