import clsx from "clsx"
import type { FC } from "react"
import Avatar from "./components/avatar"
import Card, { type CardProps } from "./components/card"
import type { UserSession } from "../lib/api"

type UserCardProps = CardProps & UserSession


const UserCard: FC<UserCardProps> = ({ user, session, className, ...props }) => {
  return (
    <Card
      className={clsx(
        className,
        "flex items-center gap-6 bg-gradient-to-l via-surface via-[16px] from-[16px] rounded-l-full",
        session.status === "inactive" && "from-red-light",
        session.status === "active" && "from-green",
        session.status === "cheater" && "from-orange",
      )}
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
