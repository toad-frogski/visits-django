import type { FC, HTMLAttributes } from "react";
import { useNavigate } from "react-router";
import clsx from "clsx";
import Avatar from "@/shared/components/ui/avatar";

import Dropdown, {
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/shared/ui/components/dropdown";
import { useSession } from "@/shared/model/session";
import { LogOut, Settings } from "lucide-react";

type ProfileMenuProps = HTMLAttributes<HTMLDivElement>;

const ProfileMenu: FC<ProfileMenuProps> = ({ className, ...props }) => {
  const user = useSession((state) => state.user);
  const logout = useSession((state) => state.clearUser);
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
            <LogOut />
            Выйти
          </DropdownItem>
        </DropdownContent>
      </Dropdown>
    </div>
  );
};

export default ProfileMenu;
