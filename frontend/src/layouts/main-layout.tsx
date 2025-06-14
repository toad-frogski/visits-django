import type { FC } from "react";
import { Outlet } from "react-router";
import Sidebar from "../ui/sidebar";

import Grid from "../assets/grid.svg?react";
import Clock from "../assets/clock.svg?react";
import MobileNav from "@/ui/mobile-nav";

const navItems = [
  { label: "General", to: "/home", icon: Clock },
  { label: "Users", to: "/list", icon: Grid },
];

const MainLayout: FC = () => {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar items={navItems} />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};

export default MainLayout;
