import { type ButtonHTMLAttributes, type FC, type ReactElement, type SVGProps } from "react";
import clsx from "clsx";
import { NavLink, useLocation, useNavigate, type NavLinkProps } from "react-router";
import { useSession } from "../contexts/session";
import useDesktop from "../lib/hooks/useDesktop";

import Logo from "../assets/deeplace.svg?react";
import LogoutIcon from "../assets/log-out.svg?react";

type SidebarItem = {
  label: string;
  to: string;
  icon?: FC<SVGProps<SVGSVGElement>>;
};

type SidebarProps = {
  items: SidebarItem[];
};

const Sidebar: FC<SidebarProps> = ({ items }) => {
  const isDesktop = useDesktop();
  const { logout } = useSession();

  if (!isDesktop) return null;

  return (
    <aside className="flex flex-col h-screen py-14 pl-8 font-bold text-gray bg-surface">
      <header className="flex gap-3 mb-12 mr-12 items-center justify-center">
        <Logo width={24} height={24} />
        <span className="text-accent text-h3">Visits</span>
      </header>

      <nav className="flex-1">
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.to}>
              <SidebarBreadcrumb {...item} />
            </li>
          ))}
        </ul>
      </nav>

      <footer className="mt-12">
        <SidebarBreadcrumb
          label="Sign out"
          icon={LogoutIcon}
          to={""}
          onClick={() => logout()}
          className={"bg-surface"}
        />
      </footer>
    </aside>
  );
};

type SidebarBreadcrumbProps = Omit<NavLinkProps, "to"> & SidebarItem;

const SidebarBreadcrumb: FC<SidebarBreadcrumbProps> = ({ icon: Icon, label, className, ...props }) => {
  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        clsx(
          className,
          "flex items-center gap-3 py-3 pl-4 pr-12 rounded-l-full hover:bg-background transition-colors",
          {
            "bg-background": isActive,
          }
        )
      }
    >
      {Icon && <Icon width={24} height={24} />}
      <span>{label}</span>
    </NavLink>
  );
};

export default Sidebar;
