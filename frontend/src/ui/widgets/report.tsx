import {
  ExtraFieldBaseTypeEnum,
  StatisticsApi,
  type ExtraFieldBase,
  type RedmineExtraFieldPayload,
  type UserMonthStatisticsResponse,
} from "@/lib/api";
import client from "@/lib/api-client";
import { formatTime, parseMs } from "@/lib/utils";
import { useEffect, useRef, useState, type FC } from "react";

import Calendar from "@/assets/calendar.svg?react";
import Clock from "@/assets/clock.svg?react";
import Coffee from "@/assets/coffee.svg?react";
import Soup from "@/assets/soup.svg?react";
import Disclosure, { DisclosurePanel, DisclosureTrigger } from "@/ui/components/disclosure";
import type { DisclosureProps } from "react-aria-components";

const api = new StatisticsApi(undefined, undefined, client);

const Report: FC = () => {
  const [stats, setStats] = useState<UserMonthStatisticsResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const current = new Date();

  useEffect(() => {
    api
      .statistics()
      .then(({ data }) => setStats(data))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="rounded w-full">
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
      {stats.map((item) => {
        if (current.toISOString().split("T")[0] === item.date) {
          return <CurrentReportItem key={item.date} {...item} />;
        }

        return <ReportItem key={item.date} {...item} />;
      })}
    </div>
  );
};

type ReportItemProps = DisclosureProps & UserMonthStatisticsResponse & { current?: Date };

const ReportItem: FC<ReportItemProps> = ({ date, session, statistics, extra, current, ...props }) => {
  return (
    <Disclosure {...props}>
      <DisclosureTrigger>
        <div className="flex gap-6 items-center flex-col md:flex-row">
          <DateBadge date={date} />
          <StatisticsBadge statistics={statistics} />
          <ExtraBadge extra={extra} />
        </div>
      </DisclosureTrigger>
      <DisclosurePanel>
        {session?.entries.map((entry) => {
          const start = new Date(entry.start!);
          const end = entry.end ? new Date(entry.end) : current;

          return (
            <div key={entry.id} className="text-gray flex gap-3 items-center mb-2">
              {entry.type === "BREAK" && <Coffee width={16} height={16} />}
              {entry.type === "LUNCH" && <Soup width={16} height={16} />}
              {entry.type === "WORK" && <Clock width={16} height={16} />}
              {start.toLocaleTimeString()}
              <span> - </span>
              {end?.toLocaleTimeString() ?? "--:--"}
              {entry.comment && <span className="text-gray">{entry.comment}</span>}
            </div>
          );
        })}
      </DisclosurePanel>
    </Disclosure>
  );
};

const CurrentReportItem: FC<ReportItemProps> = ({ statistics, session, ...props }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  let workSeconds = statistics?.work_time ?? 0;
  let lunchSeconds = statistics?.lunch_time ?? 0;
  let breakSeconds = statistics?.break_time ?? 0;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (session) {
    const last = session.entries[session.entries.length - 1];
    if (last?.start) {
      const lastStart = new Date(last.start).getTime();

      if (!isNaN(lastStart)) {
        const currentDuration = Math.floor((currentDate.getTime() - lastStart) / 1000);

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

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session]);

  return (
    <ReportItem
      {...props}
      statistics={{ work_time: workSeconds, break_time: breakSeconds, lunch_time: lunchSeconds }}
      session={session}
      current={currentDate}
    />
  );
};

const DateBadge: FC<{ date: string }> = ({ date }) => {
  return (
    <span className="inline-flex items-center gap-3 text-gray">
      <Calendar width={16} height={16} /> {date}
    </span>
  );
};

type StatisticsBadgeProps = Pick<UserMonthStatisticsResponse, "statistics">;

const StatisticsBadge: FC<StatisticsBadgeProps> = ({ statistics }) => {
  const formattedWorkTime = parseMs((statistics.work_time || 0) * 1000);
  const formattedLunchTime = parseMs((statistics.lunch_time || 0) * 1000);
  const formattedBreakTime = parseMs((statistics.break_time || 0) * 1000);

  return (
    <div className="flex gap-3">
      {[
        { time: formattedWorkTime, icon: Clock },
        { time: formattedLunchTime, icon: Soup },
        { time: formattedBreakTime, icon: Coffee },
      ].map(({ time, icon: Icon }) => (
        <span className="inline-flex items-center text-gray w-16 flex-1 gap-1">
          {formatTime(time)}
          <Icon width={16} height={16} className="ml-auto" />
        </span>
      ))}
    </div>
  );
};

type ExtraBadgeProps = {
  extra: ExtraFieldBase[];
};

const ExtraBadge: FC<ExtraBadgeProps> = ({ extra }) => {
  return (
    <div className="flex gap-3">
      {extra.map(
        ({ type, payload }) =>
          ({
            [ExtraFieldBaseTypeEnum.Redmine]: <RedmineBadge {...payload} />,
          }[type])
      )}
    </div>
  );
};

const RedmineBadge: FC<RedmineExtraFieldPayload> = ({ hours }) => {
  const time = parseMs(hours || 0);
  const formatted = formatTime(time);

  return <span className="text-gray">redmine: {formatted}</span>;
};

export default Report;
