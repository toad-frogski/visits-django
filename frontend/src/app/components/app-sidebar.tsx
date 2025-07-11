import { VisitsSessionButton } from "@/features/visits-controller";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Users, LogIn, Blocks, Settings } from "lucide-react";

import type { FC } from "react";
import { NavLink } from "react-router-dom";

// Menu items.
const publicItems = [
  {
    title: "Users",
    url: ROUTES.USERS,
    icon: Users,
  },
];

const privateItems = [
  {
    title: "Dashboard",
    url: ROUTES.DASHBOARD,
    icon: Blocks,
  },
  {
    title: "Settings",
    url: ROUTES.SETTINGS,
    icon: Settings,
  },
];

const AppSidebar: FC = () => {
  const user = useSession((state) => state.user);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="mt-3">
            <SidebarMenu className="gap-3">
              {/* Public routes */}
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url}>
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive}>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
              {/* Private routes */}
              {user &&
                privateItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink to={item.url}>
                      {({ isActive }) => (
                        <SidebarMenuButton isActive={isActive}>
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <VisitsSessionButton />
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <NavLink to={ROUTES.LOGIN}>
                {({ isActive }) => (
                  <SidebarMenuButton isActive={isActive}>
                    <LogIn />
                  </SidebarMenuButton>
                )}
              </NavLink>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
