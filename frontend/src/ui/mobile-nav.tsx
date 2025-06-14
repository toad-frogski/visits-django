import useDesktop from "@/lib/hooks/useDesktop";
import type { NavItem } from "@/ui/sidebar";
import type { FC } from "react";
import { NavLink } from "react-router";

import Grid from "@/assets/grid.svg?react";
import Clock from "@/assets/clock.svg?react";


const MobileNav: FC = () => {
  const isDesktop = useDesktop();

  const items = [
    { to: "/dashboard", label: "Dashboard", icon: Clock },
    { to: "/users", label: "Dashboard", icon: Grid }
  ];

  if (isDesktop) return null;

  return (
    <nav className="fixed bottom-0 left-0 h-[80px] w-full bg-surface p-4">
      <ul className="flex gap-3 justify-around">
        {items.map(({ to, label, icon }) => (
          <li key={to}>
            <MobileNavItem label={label} to={to} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

const MobileNavItem: FC<NavItem> = ({ to, label, icon }) => {
  return <NavLink to={to}>{label}</NavLink>;
};

export default MobileNav;
