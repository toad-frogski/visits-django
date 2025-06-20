import {
  useEffect,
  useRef,
  useState,
  type FC,
  type HTMLAttributes,
} from "react";
import CircleProgress, {
  type CircleProgressProps,
} from "@/ui/components/circle-progress";
import useDesktop from "@/lib/hooks/useDesktop";
import { cn } from "@/lib/cn";
import useAuthStore from "@/stores/auth";
import { tv } from "tailwind-variants";
import { parseMs } from "@/lib/utils";

type TimerProps = HTMLAttributes<HTMLDivElement>;

const Timer: FC<TimerProps> = ({ className, ...props }) => {
  const session = useAuthStore((state) => state.session);
  const [storedTime, setStoredTime] = useState<{ work: number; break: number }>(
    { work: 0, break: 0 }
  );
  const [passed, setPassed] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setPassed(0);
    timer.current = setInterval(() => {
      setPassed((prev) => prev + 1);
    }, 1000) as unknown as number;

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const sessionTime = session.entries.reduce(
      (acc, entry) => {
        const a = new Date(entry.start!).getTime();
        const b = new Date(entry.end ?? new Date()).getTime();

        if (isNaN(a) || isNaN(b)) {
          return acc;
        }

        const diff = b - a;

        if (entry.type === "WORK") {
          acc.work += diff;
        } else if (entry.type !== "SYSTEM") {
          acc.break += diff;
        }

        return acc;
      },
      { work: 0, break: 0 }
    );

    setStoredTime(sessionTime);
  }, [session]);

  const workMs =
    session?.status === "active"
      ? storedTime.work + passed * 1000
      : storedTime.work;
  const breakMs =
    session?.status !== "active"
      ? storedTime.break + passed * 1000
      : storedTime.break;

  return (
    <TimerBlock
      current={workMs}
      total={1000 * 60 * 60 * 8}
      extra={breakMs !== 0 ? breakMs : undefined}
      className={className}
      color={session?.status === "cheater" ? "red" : "accent"}
      {...props}
    />
  );
};

type TimerBlockProps = HTMLAttributes<HTMLDivElement> & {
  current: number;
  total: number;
  extra?: number;
  color?: CircleProgressProps["color"];
};

export const TimerBlock: FC<TimerBlockProps> = ({
  current,
  total,
  extra,
  color,
  className,
  ...props
}) => {
  const desktop = useDesktop();

  const currentTime = parseMs(current);
  const extraTime = parseMs(extra ?? 0);

  return (
    <div
      className={cn(
        className,
        "w-fit bg-surface p-3 md:p-6 shadow rounded-3xl"
      )}
      {...props}
    >
      <div className="flex items-center justify-center size-24 md:size-32 relative">
        <CircleProgress
          size={desktop ? 128 : 96}
          strokeWidth={desktop ? 10 : 7}
          progress={(current / total) * 100}
          className="absolute left-0 top-0"
          color={color}
        />
        <TimeLabel
          days={currentTime.days}
          hours={currentTime.hours}
          minutes={currentTime.minutes}
          className="z-10"
        />
      </div>
      {extraTime.minutes !== 0 && (
        <TimeLabel
          size="sm"
          days={extraTime.days}
          hours={extraTime.hours}
          minutes={extraTime.minutes}
          className="mt-3 text-center"
        />
      )}
    </div>
  );
};

type Time = {
  days: number;
  hours: number;
  minutes: number;
  seconds?: number;
};

type TimeLabelProps = HTMLAttributes<HTMLDivElement> &
  Time & {
    size?: "md" | "sm";
  };

const timeLabel = tv({
  base: "font-bold text-gray",
  variants: {
    size: {
      md: "md:text-h3/h3",
      sm: "md:text-lg text-xs",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const TimeLabel: FC<TimeLabelProps> = ({
  days,
  hours,
  minutes,
  seconds,
  className,
  size = "md",
  ...props
}) => {
  return (
    <p className={cn(timeLabel({ size }), className)} {...props}>
      {days !== 0 && <span>{String(days).padStart(2, "0")}:</span>}
      <span>{String(hours).padStart(2, "0")}</span>:
      <span>{String(minutes).padStart(2, "0")}</span>
      {seconds && <span>:{String(seconds).padStart(2, "0")}</span>}
    </p>
  );
};

export default Timer;
