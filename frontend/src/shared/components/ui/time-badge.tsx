import { cn, formatTime, parseMs } from "@/shared/lib/utils";
import type { FC, HTMLAttributes } from "react";

type TimeBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  ms: number;
  options?: {
    roundHours?: boolean;
    roundMinutes?: boolean;
    roundSeconds?: boolean;
  };
};

const TimeBadge: FC<TimeBadgeProps> = ({ ms, options = {}, className, children, ...props }) => {
  const time = parseMs(ms, options);
  const formatted = formatTime(time.hours, time.minutes);

  return (
    <span {...props} className={cn(className)}>
      {formatted}
      {children}
    </span>
  );
};

export default TimeBadge;
