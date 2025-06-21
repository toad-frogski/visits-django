import { useEffect, type FC } from "react";
import { NavLink, Outlet } from "react-router";
import Timer from "@/ui/widgets/timer";
import useAuthStore from "@/stores/auth";
import useDesktop from "@/lib/hooks/useDesktop";
import { SidebarBreadcrumb, type NavItem } from "@/ui/sidebar";
import { cn } from "@/lib/cn";
import RedmineTimer from "@/ui/widgets/redmine-timer";

const breadcrumbs = [
  { to: "general", label: "Главная" },
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
    <div className="flex h-full flex-col md:flex-row">
      {desktop ? (
        <section className="bg-surface h-full pl-6 py-6 shadow fixed">
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
      <div className="flex flex-1 gap-3 md:gap-6 flex-col lg:flex-row-reverse p-3 md:p-6 md:pl-[164px]">
        <section className="sticky top-0 flex justify-between lg:justify-start lg:flex-col gap-3">
          <Timer />
          <RedmineTimer />
        </section>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
