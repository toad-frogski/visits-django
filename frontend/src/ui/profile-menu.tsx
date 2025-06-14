import type { FC, HTMLAttributes } from "react";
import Avatar from "@/ui/components/avatar";
import useAuthStore from "@/stores/auth";
import clsx from "clsx";
import Dropdown, {
  DropdownButton,
  DropdownItem,
} from "@/ui/components/dropdown";

import LogoutIcon from "@/assets/log-out.svg?react";
import Settings from "@/assets/settings.svg?react";

type ProfileMenuProps = HTMLAttributes<HTMLDivElement>;

const ProfileMenu: FC<ProfileMenuProps> = ({ className, ...props }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  if (!user) return;

  return (
    <div className={clsx(className, "select-none")} {...props}>
      <Dropdown
        button={
          <Avatar
            className="cursor-pointer"
            src={user.avatar}
            alt={user.full_name}
          />
        }
        className="bottom-[calc(100%+10px)] rounded-lg bg-surface border border-gray-light"
      >
        <DropdownItem to={"/profile"}>
          <Settings /> Профиль
        </DropdownItem>
        <hr className="border border-gray-light" />
        <DropdownButton onClick={logout}>
          <LogoutIcon />
          Выйти
        </DropdownButton>
      </Dropdown>
    </div>
  );
};

export default ProfileMenu;
