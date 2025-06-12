import type { FC } from "react";
import { Outlet } from "react-router";

const Home: FC = () => {
  return (
    <div className="flex gap-12">
      <section className="flex-2">
        <Outlet />
      </section>
      <section className="flex-1 flex items-center justify-center h-[300px] bg-surface shadow">
        <p>Пространство для виджетов</p>
      </section>
    </div>
  )
}

export default Home;
