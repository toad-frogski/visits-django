import { type FC, type HTMLAttributes } from "react";
import useDesktop from "@/shared/hooks/useDesktop";
import { cn, parseMs } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";
import CircleProgress, { type CircleProgressStyleProps } from "@/shared/components/ui/circle-progress";

type TimerProps = HTMLAttributes<HTMLDivElement> &
  CircleProgressStyleProps & {
    current: number;
    total: number;
    extra?: number;
  };

export const Timer: FC<TimerProps> = ({
  current,
  total,
  extra,
  className,
  circleClassName = "stroke-primary",
  strokeWidth = 10,
  size = 128,
  ...props
}) => {
  const desktop = useDesktop();

  const currentTime = parseMs(current);
  const extraTime = parseMs(extra ?? 0);

  return (
    <Card {...props} className={cn("w-fit p-2", className)}>
      <CardContent className="relative p-2">
        <div className="flex items-center justify-center ">
          <CircleProgress
            size={desktop ? size : 96}
            strokeWidth={desktop ? strokeWidth : 7}
            progress={(current / total) * 100}
            circleClassName={circleClassName}
          />
          <TimeLabel
            days={currentTime.days}
            hours={currentTime.hours}
            minutes={currentTime.minutes}
            className="z-10 absolute text-md text-primary"
          />
        </div>
        {extra !== 0 && (
          <TimeLabel
            days={extraTime.days}
            hours={extraTime.hours}
            minutes={extraTime.minutes}
            className="mt-3 text-center text-sm text-primary/80"
          />
        )}
      </CardContent>
    </Card>
  );
};

type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds?: number;
};

type TimeLabelProps = HTMLAttributes<HTMLDivElement> & Time;

const TimeLabel: FC<TimeLabelProps> = ({ days, hours, minutes, seconds, className, ...props }) => {
  return (
    <p className={className} {...props}>
      {days !== 0 && <span>{String(days).padStart(2, "0")}:</span>}
      <span>{String(hours).padStart(2, "0")}</span>:<span>{String(minutes).padStart(2, "0")}</span>
      {seconds && <span>:{String(seconds).padStart(2, "0")}</span>}
    </p>
  );
};

export default Timer;
