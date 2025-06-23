import DateRangePicker from "@/ui/components/date-range";
import { useEffect, useRef, useState, type FC, type HTMLAttributes } from "react";
import { DisclosureGroup, type DateValue, type DisclosureProps } from "react-aria-components";
import { useSearchParams } from "react-router";
import { type RangeValue } from "@react-types/shared";
import Card from "@/ui/components/card";
import {
  ExtraFieldBaseTypeEnum,
  StatisticsApi,
  type ExtraFieldBase,
  type HolidaysExtraFieldPayload,
  type RedmineExtraFieldPayload,
  type UserMonthStatisticsResponse,
} from "@/lib/api";
import client from "@/lib/api-client";
import TimeBadge from "@/ui/components/time-badge";
import { formatTime, parseDate, parseMs } from "@/lib/utils";
import Disclosure, { DisclosurePanel, DisclosureTrigger } from "@/ui/components/disclosure";

import Calendar from "@/assets/calendar.svg?react";
import Clock from "@/assets/clock.svg?react";
import Coffee from "@/assets/coffee.svg?react";
import Soup from "@/assets/soup.svg?react";
import { cn } from "@/lib/cn";

const api = new StatisticsApi(undefined, undefined, client);

const DashboardReport: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState<UserMonthStatisticsResponse[]>([]);
  const [range, setRange] = useState<RangeValue<DateValue> | null>(() => {
    const start = parseDate(searchParams.get("start"));
    const end = parseDate(searchParams.get("end"));
    if (!start || !end) return null;

    return {
      start: start,
      end: end,
    };
  });

  useEffect(() => {
    const start = range?.start
      ? `${range.start.year}-${String(range.start.month).padStart(2, "0")}-${String(range.start.day).padStart(2, "0")}`
      : searchParams.get("start") ?? undefined;
    const end = range?.end
      ? `${range.end.year}-${String(range.end.month).padStart(2, "0")}-${String(range.end.day).padStart(2, "0")}`
      : searchParams.get("end") ?? undefined;

    api
      .statistics(end, start)
      .then(({ data }) => setStats(data))
      .catch(() => setStats([]));
  }, [range, searchParams]);

  useEffect(() => {
    if (range?.start && range?.end) {
      const start = `${range.start.year}-${String(range.start.month).padStart(2, "0")}-${String(
        range.start.day
      ).padStart(2, "0")}`;
      const end = `${range.end.year}-${String(range.end.month).padStart(2, "0")}-${String(range.end.day).padStart(
        2,
        "0"
      )}`;
      setSearchParams({ start: start, end: end });
    }
  }, [range, setSearchParams]);

  return (
    <div className="flex-1">
      <DateRangePicker onChange={(range) => setRange(range)} value={range} />
      <div className="mt-6">
        <TotalTrackedTimeBadge stats={stats} />
        <RedmineTotalTrackedTimeBadge stats={stats} />
      </div>
      <Report stats={stats} className="mt-6" />
    </div>
  );
};

const TotalTrackedTimeBadge: FC<{ stats: UserMonthStatisticsResponse[] }> = ({ stats }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const calculated = stats.reduce((acc, item) => (acc += item.statistics.work_time ?? 0), 0);

    setTime(calculated);
  }, [stats]);

  if (time === 0) return;

  return (
    <Card className="rounded-full text-gray w-fit" size="sm">
      <span>Visits: </span>
      <TimeBadge ms={time * 1000} options={{ roundHours: false }} />
    </Card>
  );
};

const RedmineTotalTrackedTimeBadge: FC<{ stats: UserMonthStatisticsResponse[] }> = ({ stats }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const calculated = stats.reduce((acc, item) => {
      const redmineExtra = item.extra.find((extra) => extra.type === "redmine");
      if (!redmineExtra) return acc;

      acc += (redmineExtra.payload as RedmineExtraFieldPayload).hours;

      return acc;
    }, 0);

    setTime(calculated);
  }, [stats]);

  if (time === 0) return;

  return (
    <Card className="rounded-full text-gray w-fit" size="sm">
      <span>Redmine: </span>
      <TimeBadge ms={time * 1000 * 60 * 60} options={{ roundHours: false }} />
    </Card>
  );
};

type ReportProps = HTMLAttributes<HTMLDivElement> & {
  stats?: UserMonthStatisticsResponse[];
};

const Report: FC<ReportProps> = ({ stats, className, ...props }) => {
  const current = new Date();

  if (!stats) {
    return (
      <div className={cn(className, "w-full")}>
        {[...Array(10)].map((_, i) => (
          <Disclosure key={i} className="w-full bg-surface mb-3 rounded overflow-hidden p-2 animate-pulse h-10" />
        ))}
      </div>
    );
  }

  return (
    <DisclosureGroup className={className} {...props}>
      {stats.map((item) => {
        if (current.toISOString().split("T")[0] === item.date) {
          return <CurrentReportItem key={item.date} {...item} />;
        }

        return <ReportItem key={item.date} {...item} />;
      })}
    </DisclosureGroup>
  );
};

type ReportItemProps = DisclosureProps & UserMonthStatisticsResponse & { current?: Date };

const ReportItem: FC<ReportItemProps> = ({ date, session, statistics, extra, current, ...props }) => {
  return (
    <Disclosure {...props} className="rounded w-full">
      <DisclosureTrigger isDisabled={!session}>
        <div className="flex gap-3 md:gap-6 items-center flex-col md:flex-row">
          <DateBadge date={date} />
          {session ? <StatisticsBadge statistics={statistics} /> : <span className="text-gray"> --- </span>}
          <ExtraBadge extra={extra} date={date} />
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
      statistics={{
        work_time: workSeconds,
        break_time: breakSeconds,
        lunch_time: lunchSeconds,
      }}
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
  return (
    <div className="flex gap-3">
      {[
        { key: "work", time: statistics.work_time, icon: Clock },
        { key: "lunch", time: statistics.lunch_time, icon: Soup },
        { key: "break", time: statistics.break_time, icon: Coffee },
      ].map(({ key, time, icon: Icon }) => (
        <TimeBadge key={key} className="inline-flex items-center w-16 flex-1 gap-1" ms={time ? time * 1000 : 0}>
          <Icon width={16} height={16} className="ml-auto" />
        </TimeBadge>
      ))}
    </div>
  );
};

type ExtraBadgeProps = {
  extra: ExtraFieldBase[];
  date: string;
};

const ExtraBadge: FC<ExtraBadgeProps> = ({ extra, date }) => {
  return (
    <div className="flex gap-3">
      {extra.map(
        ({ type, payload }) =>
          ({
            [ExtraFieldBaseTypeEnum.Redmine]: (
              <RedmineBadge key={`${date}-${type}`} {...(payload as RedmineExtraFieldPayload)} />
            ),
            [ExtraFieldBaseTypeEnum.Holidays]: (
              <HolidaysBadge key={`${date}-${type}`} {...(payload as HolidaysExtraFieldPayload)} />
            ),
          }[type])
      )}
    </div>
  );
};

const HolidaysBadge: FC<HolidaysExtraFieldPayload> = ({ type }) => {
  return <span className="text-gray">{type}</span>;
};

const RedmineBadge: FC<RedmineExtraFieldPayload> = ({ hours }) => {
  const time = parseMs((hours || 0) * 1000 * 60 * 60);
  const formatted = formatTime(time);

  return <span className="text-gray">redmine: {formatted}</span>;
};

export default DashboardReport;
