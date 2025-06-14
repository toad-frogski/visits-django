import { useEffect, type FC } from "react";
import { NavLink, Outlet } from "react-router";
import Card from "@/ui/components/card";
import Timer from "@/ui/widgets/timer";
import useAuthStore from "@/stores/auth";
import useDesktop from "@/lib/hooks/useDesktop";
import { SidebarBreadcrumb, type NavItem } from "@/ui/sidebar";
import { cn } from "@/lib/cn";

const breadcrumbs = [
  { to: "", label: "Главная" },
  { to: "report", label: "Отчет" },
] satisfies NavItem[];

const Dashboard: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);

  const desktop = useDesktop();

  useEffect(() => {
    if (!session) fetchSession();
  }, []);

  return (
    <div className="flex h-full flex-col md:flex-row max-h-screen">
      {desktop ? (
        <section className="bg-surface h-full pl-6 py-6 shadow">
          <nav>
            <ul className="flex flex-col gap-3">
              {breadcrumbs.map(({ to, label }) => (
                <SidebarBreadcrumb
                  key={`dashboard-${to}`}
                  label={label}
                  to={to}
                  long
                />
              ))}
            </ul>
          </nav>
        </section>
      ) : (
        <nav>
          <ul className="flex gap-3 justify-around bg-surface">
            {breadcrumbs.map(({ to, label }) => (
              <NavLink
                key={`dashboard-${to}`}
                to={to}
                className={({ isActive }) =>
                  cn("p-4", isActive ? "text-accent" : "text-gray")
                }
              >
                {label}
              </NavLink>
            ))}
          </ul>
        </nav>
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
