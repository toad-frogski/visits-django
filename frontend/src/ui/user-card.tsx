import type { FC } from "react";
import Avatar from "@/ui/components/avatar";
import Card, { type CardProps } from "@/ui/components/card";
import type { UserSession } from "@/lib/api";
import { cn } from "@/lib/cn";
import { tv } from "tailwind-variants";

type UserCardProps = CardProps & UserSession;

const userCard = tv({
  base: "flex items-center gap-6 rounded-l-full bg-gradient-to-l from-[16px] via-surface via-[16px]",
  variants: {
    status: {
      inactive: "from-background",
      active: "from-accent",
      cheater: "from-red",
      holiday: "from-gray",
      vacation: "from-yellow",
      sick: "from-yellow",
    },
  },
  defaultVariants: {
    status: "inactive",
  },
});

const UserCard: FC<UserCardProps> = ({
  user,
  session,
  className,
  ...props
}) => {
  return (
    <Card
      className={cn(className, userCard({ status: session.status }))}
      {...props}
    >
      <Avatar src={user.avatar} alt={user.full_name} />
      <div className="overflow-hidden flex-1">
        <p className="text-gray font-bold md:text-h3">{user.full_name}</p>
        {session.comment && (
          <p
            className="block overflow-hidden text-ellipsis whitespace-nowrap text-gray"
            title={session.comment}
          >
            {session.comment}
          </p>
        )}
      </div>
    </Card>
  );
};

export default UserCard;
