import { useEffect, useRef, useState, type FC, type HTMLAttributes } from "react";
import { type SessionModel } from "@/lib/api";
import CircleProgress from "@/ui/components/circle-progress";
import useDesktop from "@/lib/hooks/useDesktop";
import { cn } from "@/lib/cn";

type TimerProps = HTMLAttributes<HTMLDivElement> & {
  session: SessionModel | null;
};

const Timer: FC<TimerProps> = ({ session, className, ...props }) => {
  const [storedTime, setStoredTime] = useState<{ work: number; break: number }>({ work: 0, break: 0 });
  const [passed, setPassed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (session?.status === "active") {
      setPassed(0);
      intervalRef.current = setInterval(() => {
        setPassed((prev) => prev + 1);
      }, 1000) as unknown as number;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const sessionTime = session.entries.reduce(
      (acc, entry) => {
        if ((!entry.end || !entry.start) && session.status !== "active") {
          return acc;
        }

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



  const workMs = session?.status === "active" ? storedTime.work + passed * 1000 : storedTime.work;
  const breakMs = session?.status !== "active" ? storedTime.break + passed * 1000 : storedTime.break;

  return (
    <TimerBlock
      current={workMs}
      total={(1000 * 60 * 60 * 8)}
      extra={breakMs !== 0 ? breakMs : undefined}
      className={className} {...props}
    />
  );
};

type TimerBlockProps = HTMLAttributes<HTMLDivElement> & {
  current: number;
  total: number;
  extra?: number;
}

export const TimerBlock: FC<TimerBlockProps> = ({ current, total, extra, className, ...props }) => {
  const desktop = useDesktop();

  const format = (ms: number) => {
    return {
      hours: Math.floor(ms / (60 * 60 * 1000)) % 24,
      minutes: Math.floor(ms / (60 * 1000)) % 60,
      seconds: Math.floor(ms / 1000) % 60,
    };
  };

  const currentTime = format(current);
  const extraTime = format(extra ?? 0);


  return (
    <div className={cn(className, "w-fit bg-surface p-3 md:p-6 shadow rounded-3xl")} {...props}>
      <div className="flex items-center justify-center size-24 md:size-32 relative">
        <CircleProgress
          size={desktop ? 128 : 96}
          strokeWidth={desktop ? 10 : 7}
          progress={current / total * 100}
          className="absolute left-0 top-0"
        />
        <TimeLabel hours={currentTime.hours} minutes={currentTime.minutes} />
      </div>
      {extraTime.minutes !== 0 && <TimeLabel hours={extraTime.hours} minutes={extraTime.minutes} className="mt-3 text-center !text-lg" />}
    </div>
  );
}

type TimeLabelProps = HTMLAttributes<HTMLDivElement> & { hours: number; minutes: number; seconds?: number }

const TimeLabel: FC<TimeLabelProps> = ({ hours, minutes, seconds, className, ...props }) => {
  return (
    <p className={cn("md:text-h3 text-2xl font-bold text-gray", className)} {...props}>
      <span>{String(hours).padStart(2, "0")}</span>:
      <span>{String(minutes).padStart(2, "0")}</span>
      {seconds && <span>:{String(seconds).padStart(2, "0")}</span>}
    </p>
  )
}

export default Timer;
