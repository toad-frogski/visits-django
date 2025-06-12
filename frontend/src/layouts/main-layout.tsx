import type { FC } from "react";
import { Outlet } from "react-router";
import Sidebar from "../ui/sidebar";

import Grid from "../assets/grid.svg?react";
import Clock from "../assets/clock.svg?react";
import Settings from "../assets/settings.svg?react";
import Folder from "../assets/folder-plus.svg?react";
import Calendar from "../assets/calendar.svg?react";

const navItems = [
  { label: "General", to: "/", icon: Grid },
  { label: "Shedule", to: "/schedule", icon: Clock },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "Requests", to: "/requests", icon: Folder },
  { label: "Calendar", to: "/calendar", icon: Calendar },
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
