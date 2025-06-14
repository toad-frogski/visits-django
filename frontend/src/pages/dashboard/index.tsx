import { useEffect, type FC } from "react";
import { Outlet } from "react-router";
import Card from "@/ui/components/card";
import Timer from "@/ui/widgets/timer";
import useAuthStore from "@/stores/auth";
import useDesktop from "@/lib/hooks/useDesktop";
import { SidebarBreadcrumb } from "@/ui/sidebar";

const Dashboard: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);

  const desktop = useDesktop();

  useEffect(() => {
    if (!session) fetchSession();
  }, []);

  return (
    <div className="flex h-full max-h-screen">
      {desktop && (
        <section className="bg-surface h-full pl-6 py-6 shadow">
          <nav>
            <ul className="flex flex-col gap-3">
              <SidebarBreadcrumb label={"Главная"} to={""} long />
            </ul>
          </nav>
        </section>
      )}
      <div className="p-3 md:p-6 flex flex-1 gap-3 md:gap-6 flex-col md:flex-row-reverse">
        <section>
          <Timer />
        </section>
        <Card className="rounded h-fit md:flex-1">
          <Outlet />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
