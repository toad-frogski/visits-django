import { StatisticsApi, type UserMonthStatisticsResponse } from "@/lib/api";
import client from "@/lib/api-client";
import { parseMs, type Time } from "@/lib/utils";
import { useEffect, useRef, useState, type FC } from "react";

import Clock from "@/assets/clock.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Soup from "@/assets/soup.svg?react";
import Disclosure, { DisclosurePanel, DisclosureTrigger } from "@/ui/components/disclosure";

const api = new StatisticsApi(undefined, undefined, client);

const DashboardReport: FC = () => {
  const [stats, setStats] = useState<UserMonthStatisticsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    api
      .statistics()
      .then(({ data }) => setStats(data))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats]);

  if (isLoading) {
    return (
      <div className="rounded flex-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full bg-surface mb-3 rounded overflow-hidden p-2 animate-pulse">
            <div className="h-1 w-1/2 mb-3" />
            <div className="h-1 w-full mb-2" />
            <div className="h-1 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded flex-1">
      {stats.map(({ date, statistics, session, extra }) => {
        return (
          <Disclosure key={date}>
            <DisclosureTrigger>
              <div className="flex gap-3 items-center flex-col md:flex-row">
                <span className="text-gray text-nowrap">{date} | </span>
                <StatisticsBadge statistics={statistics} session={session} current={currentDate} />
              </div>
            </DisclosureTrigger>
            <DisclosurePanel>
              {session?.entries.map((entry) => {
                const start = new Date(entry.start!);
                const end = entry.end ? new Date(entry.end) : null;

                return (
                  <div key={entry.id} className="text-gray flex gap-3 items-center mb-2">
                    {entry.type === "BREAK" && <Leaf width={16} height={16} />}
                    {entry.type === "LUNCH" && <Soup width={16} height={16} />}
                    {entry.type === "WORK" && <Clock width={16} height={16} />}
                    {start.toLocaleTimeString()}
                    <span> - </span>
                    {end ? end.toLocaleTimeString() : (currentDate ?? new Date()).toLocaleTimeString()}
                  </div>
                );
              })}
            </DisclosurePanel>
          </Disclosure>
        );
      })}
    </div>
  );
};

type StatisticsBadgeProps = Pick<UserMonthStatisticsResponse, "session" | "statistics"> & {
  current: Date;
};

const StatisticsBadge: FC<StatisticsBadgeProps> = ({ statistics, session, current }) => {
  let workSeconds = statistics?.work_time ?? 0;
  let lunchSeconds = statistics?.lunch_time ?? 0;
  let breakSeconds = statistics?.break_time ?? 0;

  if (session?.status === "active") {
    const last = session.entries[session.entries.length - 1];
    if (last?.start) {
      const lastStart = new Date(last.start).getTime();

      if (!isNaN(lastStart)) {
        const currentDuration = Math.floor((current.getTime() - lastStart) / 1000);

        switch (last.type) {
          case "WORK":
            workSeconds += currentDuration;
            break;

          case "LUNCH":
            lunchSeconds += currentDuration;
            break;

          case "BREAK":
            breakSeconds += currentDuration;
            break;
        }
      }
    }
  }

  const workTime = parseMs(workSeconds * 1000);
  const lunchTime = parseMs(lunchSeconds * 1000);
  const breakTime = parseMs(breakSeconds * 1000);

  const format = (value: Time) => {
    if (value.hours !== 0 || value.minutes !== 0) {
      return `${String(value.hours).padStart(2, "0")}:${String(value.minutes).padStart(2, "0")}`;
    }

    return "--:--";
  };

  return (
    <div>
      {[
        { time: workTime, icon: Clock },
        { time: lunchTime, icon: Soup },
        { time: breakTime, icon: Leaf },
      ].map(({ time, icon: Icon }) => (
        <span className="inline-flex items-center text-gray w-16 flex-1 ml-3">
          {format(time)}
          <Icon width={16} height={16} className="ml-auto" />
        </span>
      ))}
    </div>
  );
};

export default DashboardReport;
