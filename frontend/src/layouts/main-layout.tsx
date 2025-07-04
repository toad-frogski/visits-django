import type { FC } from "react";
import { Outlet } from "react-router";
import Sidebar from "@/ui/sidebar";
import MobileNav from "@/ui/mobile-nav";

import Grid from "@/assets/grid.svg?react";
import Users from "@/assets/users.svg?react";
import { ToastProvider } from "@/ui/components/toast";

const navItems = [
  { label: "Dashboard", to: "dashboard", icon: Grid },
  { label: "Users", to: "users", icon: Users },
];

const MainLayout: FC = () => {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar items={navItems} />
        <main className="flex-1 pb-20 md:pb-0 overflow-y-auto md:pl-[88px]">
          <Outlet />
        </main>
        <MobileNav items={navItems} />
      </div>
    </ToastProvider>
  );
};

export default MainLayout;
