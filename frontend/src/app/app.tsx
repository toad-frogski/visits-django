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
        <main className="w-full p-3 md:p-6">
          <Outlet />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <main className="min-h-screen p-3 md:p-6">
      <Outlet />
    </main>
  );
};

export default App;
