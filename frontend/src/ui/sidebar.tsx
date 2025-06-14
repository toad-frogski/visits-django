import { type FC, type SVGProps } from "react";
import clsx from "clsx";
import { NavLink, type NavLinkProps } from "react-router";
import useDesktop from "@/lib/hooks/useDesktop";

import Logo from "@/assets/deeplace.svg?react";
import ProfileMenu from "./profile-menu";

type SidebarItem = {
  label: string;
  to: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
  long?: boolean;
};

type SidebarProps = {
  items: SidebarItem[];
  long?: boolean;
};

const Sidebar: FC<SidebarProps> = ({ items, long }) => {
  const isDesktop = useDesktop();

  if (!isDesktop) return null;

  return (
    <aside className="flex flex-col h-screen py-6 pl-4 font-bold text-gray bg-surface shadow-[2px_0px_20px_-10px] z-1">
      <header className={clsx(
        "flex gap-3 mb-12 pl-4 items-center justify-center",
        long ? "pr-10" : "pr-8",
      )}>
        <Logo width={24} height={24} />
        {long && <span className="text-h3 font-bold text-gray">Visits</span>}
      </header>

      <nav className="flex-1">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarBreadcrumb {...item} long={long} />
            </li>
          ))}
        </ul>
      </nav>

      <footer className="mt-12">
        <ProfileMenu />
      </footer>
    </aside>
  );
};

type SidebarBreadcrumbProps = Omit<NavLinkProps, "to"> & SidebarItem;

export const SidebarBreadcrumb: FC<SidebarBreadcrumbProps> = ({ icon: Icon, label, long, className, ...props }) => {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        clsx(
          className,
          "flex items-center gap-3 py-3 pl-4 pr-2 rounded-l-full hover:bg-background transition-colors",
          long ? "pr-10" : "pr-2",
          {
            "bg-background": isActive,
          }
        )
      }
    >
      {Icon && <Icon width={24} height={24} />}
      {long && <span className="text-gray">{label}</span>}
    </NavLink>
  );
};

export default Sidebar;
