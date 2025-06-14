import useDesktop from "@/lib/hooks/useDesktop";
import type { FC } from "react";
import { NavLink } from "react-router";

const MobileNav: FC = () => {
  const isDesktop = useDesktop();

  if (isDesktop) return null;

  const items = [{ to: "/home", label: "Home" }];

  return (
    <nav className="fixed bottom-0 left-0 h-[80px] w-full bg-surface shadow-2xl z-10">
      <ul className="flex gap-3">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to}>{item.label}</NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default MobileNav;
