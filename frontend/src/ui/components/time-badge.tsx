import { cn } from "@/lib/cn";
import { formatTime, parseMs } from "@/lib/utils";
import type { FC, HTMLAttributes } from "react";

type TimeBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  ms: number;
  options: {
    roundHours?: boolean;
    roundMinutes?: boolean;
    roundSeconds?: boolean;
  };
};

const TimeBadge: FC<TimeBadgeProps> = ({
  ms,
  options = {},
  className,
  children,
  ...props
}) => {
  const time = parseMs(ms, options);
  const formatted = formatTime(time);

  return (
    <span {...props} className={cn(className, "text-gray")}>
      {formatted}
      {children}
    </span>
  );
};

export default TimeBadge;
