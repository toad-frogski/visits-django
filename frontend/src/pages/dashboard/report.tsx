import DateRangePicker from "@/ui/components/date-range";
import {
  useEffect,
  useRef,
  useState,
  type FC,
  type HTMLAttributes,
} from "react";
import { DisclosureGroup, type DisclosureProps } from "react-aria-components";
import Card from "@/ui/components/card";
import {
  ExtraFieldBaseTypeEnum,
  HolidaysExtraFieldPayloadTypeEnum,
  StatisticsApi,
  type ExtraFieldBase,
  type HolidaysExtraFieldPayload,
  type RedmineExtraFieldPayload,
  type UserMonthStatisticsResponse,
} from "@/lib/api";
import client from "@/lib/api-client";
import TimeBadge from "@/ui/components/time-badge";
import { formatDate, formatTime, parseMs } from "@/lib/utils";
import Disclosure, {
  DisclosurePanel,
  DisclosureTrigger,
} from "@/ui/components/disclosure";

import Calendar from "@/assets/calendar.svg?react";
import House from "@/assets/house.svg?react";
import Cake from "@/assets/cake.svg?react";
import Clock from "@/assets/clock.svg?react";
import Coffee from "@/assets/coffee.svg?react";
import Soup from "@/assets/soup.svg?react";
import { cn } from "@/lib/cn";
import Button from "@/ui/components/button";
import useDateRangeQueryParams from "@/lib/hooks/useDateRangeQueryParams";

const api = new StatisticsApi(undefined, undefined, client);

const DashboardReport: FC = () => {
  const [stats, setStats] = useState<UserMonthStatisticsResponse[]>();
  const [range, setRange] = useDateRangeQueryParams();

  const exportReport = () => {
    const start = range?.start ? formatDate(range.start) : undefined;
    const end = range?.end ? formatDate(range.end) : undefined;

    api._export(start, end, { responseType: "blob" }).then(({ data }) => {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "report.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  useEffect(() => {
    const start = range?.start ? formatDate(range.start) : undefined;
    const end = range?.end ? formatDate(range.end) : undefined;

    api
      .statistics(end, start)
      .then(({ data }) => setStats(data))
      .catch(() => setStats([]));
  }, [range]);

  return (
    <div className="flex-1">
      <div className="flex flex-col md:flex-row gap-3 justify-between md:mt-0 mt-6">
        <Button className="md:w-fit" onClick={exportReport}>
          Скачать отчет
        </Button>
        <DateRangePicker onChange={(range) => setRange(range)} value={range} />
      </div>
      <div className="mt-6">
        <TotalTrackedTimeBadge stats={stats} />
        <RedmineTotalTrackedTimeBadge stats={stats} />
      </div>
      <Report stats={stats} className="mt-6 overflow-hidden rounded shadow" />
    </div>
  );
};

const TotalTrackedTimeBadge: FC<{ stats?: UserMonthStatisticsResponse[] }> = ({
  stats = [],
}) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const calculated = stats.reduce(
      (acc, item) => (acc += item.statistics.work_time ?? 0),
      0
    );

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

const RedmineTotalTrackedTimeBadge: FC<{
  stats?: UserMonthStatisticsResponse[];
}> = ({ stats = [] }) => {
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
          <Disclosure
            key={i}
            className="w-full bg-surface mb-3 rounded overflow-hidden p-2 animate-pulse h-10"
          />
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

type ReportItemProps = DisclosureProps &
  UserMonthStatisticsResponse & { current?: Date };

const ReportItem: FC<ReportItemProps> = ({
  date,
  session,
  statistics,
  extra,
  current,
  ...props
}) => {
  const isSpecial = !!extra.find((e) => e.type === "holidays");

  return (
    <Disclosure {...props} className="rounded w-full">
      <DisclosureTrigger
        isDisabled={!session}
        className={cn(isSpecial && "bg-accent/10")}
      >
        <div
          className={"flex gap-3 md:gap-6 items-center flex-col md:flex-row"}
        >
          <DateBadge date={date} extra={extra} />
          {session ? (
            <StatisticsBadge statistics={statistics} />
          ) : (
            <span className="text-gray"> --- </span>
          )}
          <ExtraBadge extra={extra} date={date} />
        </div>
      </DisclosureTrigger>
      <DisclosurePanel>
        {session?.entries.map((entry, i) => {
          const start = new Date(entry.start!);
            const isLast = i === session.entries.length - 1;
            const end = entry.end
              ? new Date(entry.end)
              : (isLast ? current : undefined);

          return (
            <div
              key={entry.id}
              className="text-gray flex gap-3 items-center py-1"
            >
              {entry.type === "BREAK" && <Coffee width={16} height={16} />}
              {entry.type === "LUNCH" && <Soup width={16} height={16} />}
              {entry.type === "WORK" && <Clock width={16} height={16} />}
              {start.toLocaleTimeString()}
              <span> - </span>
              {end?.toLocaleTimeString() ?? "--:--"}
              {entry.comment && (
                <span className="text-gray">{entry.comment}</span>
              )}
            </div>
          );
        })}
      </DisclosurePanel>
    </Disclosure>
  );
};

const CurrentReportItem: FC<ReportItemProps> = ({
  statistics,
  session,
  ...props
}) => {
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
        const currentDuration = Math.floor(
          (currentDate.getTime() - lastStart) / 1000
        );

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

const DateBadge: FC<{ date: string; extra?: ExtraFieldBase[] }> = ({
  date,
  extra = [],
}) => {
  const holidaysExtra = extra.find((e) => e.type === "holidays");
  const type = holidaysExtra
    ? (holidaysExtra.payload as HolidaysExtraFieldPayload).type
    : "default";

  return (
    <span className="inline-flex items-center gap-3 text-gray">
      {
        {
          [HolidaysExtraFieldPayloadTypeEnum.Holiday]: (
            <Cake width={16} height={16} />
          ),
          [HolidaysExtraFieldPayloadTypeEnum.Weekend]: (
            <House width={16} height={16} />
          ),
          default: <Calendar width={16} height={16} />,
        }[type]
      }
      {date}
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
        <TimeBadge
          key={key}
          className="inline-flex items-center w-16 flex-1 gap-1"
          ms={time ? time * 1000 : 0}
        >
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
    <div className="flex gap-3 md:ml-auto md:pr-3">
      {extra.map(
        ({ type, payload }) =>
          ({
            [ExtraFieldBaseTypeEnum.Redmine]: (
              <RedmineBadge
                key={`${date}-${type}`}
                {...(payload as RedmineExtraFieldPayload)}
              />
            ),
            [ExtraFieldBaseTypeEnum.Holidays]: null,
          }[type])
      )}
    </div>
  );
};

const RedmineBadge: FC<RedmineExtraFieldPayload> = ({ hours }) => {
  const time = parseMs((hours || 0) * 1000 * 60 * 60);
  const formatted = formatTime(time.hours, time.minutes);

  return <span className="text-gray">redmine: {formatted}</span>;
};

export default DashboardReport;
