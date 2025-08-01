import AppSidebar from "@/app/components/app-sidebar";
import MobileNav from "@/app/components/mobile-nav";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import type { FC } from "react";
import { Outlet } from "react-router-dom";

const App: FC = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={false}>
      {!isMobile && <AppSidebar />}
      {isMobile && <MobileNav />}
      <main className="w-full p-3 md:p-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default App;
