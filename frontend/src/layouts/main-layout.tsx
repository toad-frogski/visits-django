import type { FC } from "react";
import { Outlet } from "react-router";

const MainLayout: FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
