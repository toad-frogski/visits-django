import { useLogout } from "@/features/auth";
import { VisitsSessionController } from "@/features/visits-controller";
import Avatar from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
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
import { Users, LogIn, LogOut, Blocks, Settings } from "lucide-react";

import type { FC } from "react";
import { NavLink } from "react-router";

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
];

const AppSidebar: FC = () => {
  const user = useSession((state) => state.user);
  const { logout } = useLogout();

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
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <VisitsSessionController />
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar src={user.avatar} alt={user.full_name} className="!size-8" />
                    <span className="text-xs">{user.email ? user.email : user.full_name}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={12} side="right">
                  <DropdownMenuGroup>
                    <NavLink to={ROUTES.SETTINGS}>
                      <DropdownMenuItem>
                        <Settings />
                        Settings
                      </DropdownMenuItem>
                    </NavLink>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <NavLink to={ROUTES.LOGIN}>
                {({ isActive }) => (
                  <SidebarMenuButton isActive={isActive}>
                    <LogIn />
                  </SidebarMenuButton>
                )}
              </NavLink>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
