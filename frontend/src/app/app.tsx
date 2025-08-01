import { SidebarProvider } from "@/shared/components/ui/sidebar";
import { useIsMobile } from "@/shared/hooks/use-mobile";
import { Suspense, lazy, type FC } from "react";
import { Outlet } from "react-router-dom";

const AppSidebar = lazy(() => import("@/app/components/app-sidebar"));
const MobileNav = lazy(() => import("@/app/components/mobile-nav"));

const App: FC = () => {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={false}>
      <Suspense fallback={null}>
        {!isMobile && <AppSidebar />}
        {isMobile && <MobileNav />}
      </Suspense>
      <main className="w-full p-3 md:p-6 pb-24 md:pb-6">
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default App;
