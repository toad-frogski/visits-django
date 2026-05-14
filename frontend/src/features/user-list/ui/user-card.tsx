import { useMemo, type ComponentProps, type FC } from "react";
import Avatar from "@/shared/components/ui/avatar";
import type { ApiSchema } from "@/shared/api/schema";
import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { Biohazard, CircleQuestionMark, Home, Plane } from "lucide-react";

type UserCardProps = ApiSchema["UserSession"] & ComponentProps<"div">;

const UserCard: FC<UserCardProps> = ({
  user,
  session,
  className,
  ...props
}) => {
  return (
    <Card
      {...props}
      className={cn(className, "p-3 relative group rounded-md overflow-hidden")}
    >
      <CardContent className="flex gap-3 items-center p-0">
        <Avatar src={user.avatar} alt={user.full_name} />
        <div>
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
      </CardContent>
      <Status status={session.status} />
      <ExtraInfo extra={session.extra} />
    </Card>
  );
};

const Status: FC<{ status: ApiSchema["Session"]["status"] }> = ({ status }) => {
  const content = useMemo(() => {
    switch (status) {
      case "active":
      case "inactive":
        return (
          <div
            className={cn(
              "absolute h-full w-4 group-hover:opacity-80 -translate-y-1/2 top-1/2 right-0 duration-200 ease transition-all",
              {
                "bg-none": status === "inactive",
                "bg-primary": status === "active",
              },
            )}
          />
        );
      case "cheater":
        return (
          <div className={cn("absolute -right-3 -bottom-3 -rotate-12")}>
            <img
              src="/assets/img/cheater.png"
              alt="Cheater"
              className="w-full max-w-32"
            />
          </div>
        );
    }
  }, [status]);

  return content;
};

const ExtraInfo: FC<{ extra: ApiSchema["Session"]["extra"] }> = ({ extra }) => {
  if (!extra || extra.length === 0) return null;

  return (
    <div className="absolute grid grid-cols-2 inset-0 grid-rows-2 w-1/2 ml-auto rotate-12 top-2 overflow-visible gap-1">
      {extra.slice(0, 4).map((e, i) => (
        <>
        <ExtraInfoField key={`${e.type}-${i}`} data={e} slot={i} />
        </>
      ))}
    </div>
  );
};

const ExtraInfoField: FC<{
  data: ApiSchema["SessionExtraField"];
  slot: number;
}> = (props) => {
  const content = useMemo(() => {
    switch (props.data.type) {
      case "hr_deeplace":
        return <HrDeeplaceExtraField {...props} />;
      default:
        return null;
    }
  }, [props]);

  if (!content) return null;

  return content;
};

const HrDeeplaceExtraField: FC<{
  data: ApiSchema["HrDeeplaceSessionInfoPlugin"];
}> = ({ data }) => {
  const icon = useMemo(() => {
    switch (data.payload.status) {
      case "home":
        return <Home className="max-w-6" />;
      case "vacation":
        return <Plane className="max-w-6" />;
      case "sick":
        return <Biohazard className="max-w-6" />;
      default:
        return <CircleQuestionMark className="max-w-6" />;
    }
  }, [data]);

  if (!icon) return null;

  return (
    <div title={data.payload.status} className="flex items-center mx-auto">
      {icon}
    </div>
  );
};

export default UserCard;
