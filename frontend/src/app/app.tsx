import AppSidebar from "@/app/components/app-sidebar";
import { SidebarProvider } from "@/shared/components/ui/sidebar";
import useDesktop from "@/shared/hooks/useDesktop";
import type { FC } from "react";
import { Outlet } from "react-router";

const App: FC = () => {
  const desktop = useDesktop();

  if (desktop) {
    return (
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="w-full">
          <Outlet />
        </main>
      </SidebarProvider>
    );
  }

  return <Outlet />;
};

export default App;
