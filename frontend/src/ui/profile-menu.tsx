import type { FC, HTMLAttributes } from "react";
import Avatar from "@/ui/components/avatar";
import useAuthStore from "@/stores/auth";
import clsx from "clsx";

import LogoutIcon from "@/assets/log-out.svg?react";
import Settings from "@/assets/settings.svg?react";
import Dropdown, {
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/ui/components/dropdown";
import { useNavigate } from "react-router";

type ProfileMenuProps = HTMLAttributes<HTMLDivElement>;

const ProfileMenu: FC<ProfileMenuProps> = ({ className, ...props }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  if (!user) return;

  return (
    <div className={clsx(className, "select-none")} {...props}>
      <Dropdown position="top">
        <DropdownTrigger>
          <button>
            <Avatar
              className="cursor-pointer relative"
              src={user.avatar}
              alt={user.full_name}
            />
          </button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem
            className="flex gap-3"
            onClick={() => navigate("/profile")}
          >
            <Settings /> Профиль
          </DropdownItem>
          <DropdownItem
            className="flex gap-3"
            onClick={logout}
          >
            <LogoutIcon />
            Выйти
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default ProfileMenu;
