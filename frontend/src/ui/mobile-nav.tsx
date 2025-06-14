import useDesktop from "@/lib/hooks/useDesktop";
import type { NavItem } from "@/ui/sidebar";
import { type FC } from "react";
import { NavLink } from "react-router";
import { cn } from "@/lib/cn";

type MobileNavProps = {
  items: NavItem[];
};

const MobileNav: FC<MobileNavProps> = ({ items }) => {
  const isDesktop = useDesktop();

  if (isDesktop) return null;

  return (
    <nav className="fixed bottom-0 left-0 h-[80px] w-full bg-surface px-4 pb-4 shadow">
      <ul className="flex gap-3 justify-around">
        {items.map(({ to, label, icon }) => (
          <li key={to}>
            <MobileNavItem label={label} to={to} icon={icon} />
          </li>
        ))}
      </ul>
    </nav>
  );
};

const MobileNavItem: FC<NavItem> = ({ to, label, icon: Icon }) => {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div className={cn("w-20 pt-1 before:content-[''] before:h-1 before:w-full before:block before:mb-3", isActive && "before:bg-accent")}>
          {Icon && (
            <Icon
              width={24}
              height={24}
              className={cn("mx-auto", isActive && "*:stroke-accent")}
            />
          )}
          <p
            className={cn(
              "font-bold text-center",
              isActive ? "text-accent" : "text-gray"
            )}
          >
            {label}
          </p>
        </div>
      )}
    </NavLink>
  );
};

export default MobileNav;
