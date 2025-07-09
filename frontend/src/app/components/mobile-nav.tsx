import { VisitsSessionController } from "@/features/visits-controller";
import { cn } from "@/shared/lib/utils";
import { ROUTES } from "@/shared/model/routes";
import { Blocks, Users } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";
import { NavLink, useLocation } from "react-router";

const MobileNav: FC = () => {
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const updateSliderPosition = () => {
    if (!menuRef.current) return;
    const activeLink = menuRef.current.querySelector("a.active");
    if (!activeLink) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();

    setSliderStyle({
      left: activeRect.left - menuRect.left,
      width: activeRect.width,
    });
  };

  useEffect(() => {
    updateSliderPosition();

    window.addEventListener("resize", updateSliderPosition);
    return () => {
      window.removeEventListener("resize", updateSliderPosition);
    };
  }, [location.pathname]);

  return (
    <nav ref={menuRef} className="fixed bottom-0 w-full p-4 bg-card">
      <ul className="flex gap-12 justify-around items-center">
        <li>
          <NavLink to={ROUTES.USERS} className={({ isActive }) => cn(isActive && "active")}>
            <Users className="mx-auto" />
            <span>Users</span>
          </NavLink>
        </li>
        <li>
          <VisitsSessionController />
        </li>
        <li>
          <NavLink to={ROUTES.DASHBOARD} className={({ isActive }) => cn(isActive && "active")}>
            <Blocks className="mx-auto" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <span
          className="absolute top-2 h-1 bg-primary rounded-md transition-all duration-300 ease-in-out"
          style={sliderStyle}
        />
      </ul>
    </nav>
  );
};

export default MobileNav;
