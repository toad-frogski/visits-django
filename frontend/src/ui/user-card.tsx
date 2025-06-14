import type { FC } from "react"
import Avatar from "@/ui/components/avatar"
import Card, { type CardProps } from "@/ui/components/card"
import type { UserSession } from "@/lib/api"
import { cn } from "@/lib/cn"
import { tv } from "tailwind-variants"

type UserCardProps = CardProps & UserSession

const usercard = tv({
  base: "flex items-center gap-6 rounded-l-full",
  variants: {
    status: {
      inactive: "bg-gradient-to-l from-background from-[16px] via-surface via-[16px]",
      active: "bg-gradient-to-l from-accent from-[16px] via-surface via-[16px]",
      cheater: "bg-gradient-to-l from-red from-[16px] via-surface via-[16px]",
      holiday: "bg-gradient-to-l from-gray from-[16px] via-surface via-[16px]",
      vacation: "bg-gradient-to-l from-yellow from-[16px] via-surface via-[16px]"
    }
  },
  defaultVariants: {
    status: "inactive"
  }
})

const UserCard: FC<UserCardProps> = ({ user, session, className, ...props }) => {
  return (
    <Card
      className={cn(className, usercard({ status: session.status }))}
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
  )
}

export default UserCard;
