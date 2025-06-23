import DateRangePicker from "@/ui/components/date-range";
import Report from "@/ui/widgets/report";
import { useEffect, useState, type FC } from "react";
import type { DateValue } from "react-aria-components";
import { useSearchParams } from "react-router";
import { type RangeValue } from "@react-types/shared";
import Card from "@/ui/components/card";
import { StatisticsApi, type RedmineExtraFieldPayload, type UserMonthStatisticsResponse } from "@/lib/api";
import client from "@/lib/api-client";
import TimeBadge from "@/ui/components/time-badge";
import { parseDate } from "@/lib/utils";

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

export default DashboardReport;
