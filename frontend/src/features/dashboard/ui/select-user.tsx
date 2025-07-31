import { useDashboard } from "../model/dashboard.context";
import { useSelectUser } from "../model/use-select-user";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useCallback, type FC } from "react";

const SelectUser: FC = () => {
  const { user, setUser } = useDashboard();
  const { users } = useSelectUser();

  const onSelect = useCallback(
    (user_id: string) => {
      const selected = users?.find((u) => u.id === Number(user_id));
      if (selected) {
        setUser(selected);
      }
    },
    [users, setUser]
  );

  return (
    <Select onValueChange={onSelect}>
      <SelectTrigger className="w-full">
        <SelectValue defaultValue={user!.id} placeholder="Select user" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {users?.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>{user.full_name}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectUser;
