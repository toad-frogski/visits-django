import { useSelectUser } from "../model/use-select-user";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useSession } from "@/shared/model/session";
import type { FC } from "react";

const SelectUser: FC = () => {
  const user = useSession((state) => state.user)!;
  const { users } = useSelectUser();

  return (
    <Select>
      <SelectTrigger className="w-full">
        <SelectValue defaultValue={user.id} placeholder="Select user" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {users?.map((user) => (
            <SelectItem value={user.id.toString()}>{user.full_name}</SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default SelectUser;
