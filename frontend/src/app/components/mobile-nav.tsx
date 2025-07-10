import { VisitsSessionController } from "@/features/visits-controller";
import { cn } from "@/shared/lib/utils";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Blocks, LogIn, Users } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";
import { NavLink, useLocation } from "react-router-dom";

const MobileNav: FC = () => {
  const user = useSession((state) => state.user);
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
    <nav ref={menuRef} className="fixed bottom-0 w-full p-2 bg-card z-100">
      <ul className="flex gap-12 justify-around items-center pt-2">
        {user ? (
          <>
            <li>
              <NavLink to={ROUTES.USERS} className={({ isActive }) => cn("w-12 block", isActive && "active")}>
                <Users className="mx-auto size-6" />
              </NavLink>
            </li>
            <li>
              <VisitsSessionController />
            </li>
            <li>
              <NavLink to={ROUTES.DASHBOARD} className={({ isActive }) => cn("w-12 block", isActive && "active")}>
                <Blocks className="mx-auto size-6" />
              </NavLink>
              <span
                className="absolute top-2 h-1 bg-primary rounded-md transition-all duration-300 ease-in-out"
                style={sliderStyle}
              />
            </li>
          </>
        ) : (
          <li>
            <NavLink to={ROUTES.LOGIN} className={cn("w-12 block")}>
              <LogIn className="mx-auto size-6" />
            </NavLink>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default MobileNav;
