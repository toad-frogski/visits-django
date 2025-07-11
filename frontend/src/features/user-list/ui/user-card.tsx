import type { ComponentProps, FC } from "react";
import Avatar from "@/shared/components/ui/avatar";
import type { ApiSchema } from "@/shared/api/schema";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

type UserCardProps = ApiSchema["UserSession"] & ComponentProps<"div">;

const UserCard: FC<UserCardProps> = ({ user, session, className, ...props }) => {
  return (
    <Card {...props} className={cn(className, "p-3 relative group rounded-md overflow-hidden")}>
      <CardContent className="flex gap-3 items-center p-0">
        <Avatar src={user.avatar} alt={user.full_name} />
        <div>
          <p className="text-gray font-bold md:text-h3">{user.full_name}</p>
          {session.comment && (
            <p className="block overflow-hidden text-ellipsis whitespace-nowrap text-gray" title={session.comment}>
              {session.comment}
            </p>
          )}
        </div>
      </CardContent>
      <StatusLine status={session.status} />
    </Card>
  );
};

const StatusLine: FC<{ status: ApiSchema["Session"]["status"] }> = ({ status }) => {
  return (
    <div
      className={cn(
        "absolute h-full w-4 group-hover:opacity-80 -translate-y-1/2 top-1/2 right-0 duration-200 ease transition-all",
        {
          "bg-none": status === "inactive",
          "bg-primary": status === "active",
          "bg-destructive": status === "cheater",
        }
      )}
    />
  );
};

export default UserCard;
