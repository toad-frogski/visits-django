import { useVisitsSession } from "@/shared/model/visits-session";
import { useEffect, useRef, useState } from "react";

export const useVisitsTimer = () => {
  const session = useVisitsSession((state) => state.session);
  const [storedTime, setStoredTime] = useState<{ work: number; break: number }>({ work: 0, break: 0 });
  const [passed, setPassed] = useState(0);
  const timer = useRef<number>(null);

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

  const current = session?.status === "active" ? storedTime.work + passed * 1000 : storedTime.work;
  const extra = session?.status !== "active" ? storedTime.break + passed * 1000 : storedTime.break;

  return { current, extra, status: session?.status ?? "inactive" };
};
