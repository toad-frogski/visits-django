import type { FC } from "react";
import { Outlet } from "react-router";
import Sidebar from "../ui/sidebar";

import Grid from "../assets/grid.svg?react";
import Clock from "../assets/clock.svg?react"

const navItems = [
  { label: "General", to: "/home", icon: Clock },
  { label: "Users", to: "/list", icon: Grid },
];

const MainLayout: FC = () => {
  return (
    <div className="min-h-screen flex">
      <Sidebar items={navItems} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
