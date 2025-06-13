import { useEffect, type FC } from "react";
import { NavLink, Outlet } from "react-router";
import Card from "../../ui/components/card";
import Timer from "../../widgets/timer";
import useAuthStore from "../../stores/auth";
import clsx from "clsx";
import useDesktop from "../../lib/hooks/useDesktop";

const Home: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);

  const desktop = useDesktop();

  useEffect(() => {
    if (!session) fetchSession()
  }, []);

  return (
    <div className="flex h-full">
      {desktop && <section className="bg-surface h-full p-6 shadow">
        <nav>
          <ul className="flex flex-col gap-3">
            <NavLink className={({ isActive }) => isActive ? "text-accent" : "text-gray"} to={""}>
              Главная
            </NavLink>
            <NavLink className={({ isActive }) => isActive ? "text-accent" : "text-gray"} to={"report"}>
              Посмотреть отчет
            </NavLink>
          </ul>
        </nav>
      </section>}
      <div className="p-3 md:p-6 flex gap-3 md:gap-6 flex-1 flex-col md:flex-row-reverse">
        <section className="md:flex-1">
          <Timer session={session} />
        </section>
        <Card className="rounded h-fit md:flex-2">
          <Outlet />
        </Card>
      </div >
    </div>
  );
};

export default Home;
