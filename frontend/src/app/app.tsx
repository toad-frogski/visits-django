import AppSidebar from "@/app/components/app-sidebar";
import MobileNav from "@/app/components/mobile-nav";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import useDesktop from "@/shared/hooks/useDesktop";
import type { FC } from "react";
import { Outlet } from "react-router-dom";

const App: FC = () => {
  const desktop = useDesktop();

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="w-full p-3 md:p-6 pb-24 md:pb-6">
        <Outlet />
      </main>
      {!desktop && <MobileNav />}
    </SidebarProvider>
  );
};

export default App;
