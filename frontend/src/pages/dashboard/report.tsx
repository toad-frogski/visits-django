import DateRangePicker from "@/ui/components/date-range";
import Report from "@/ui/widgets/report";
import { useEffect, useState, type FC } from "react";
import type { DateValue } from "react-aria-components";
import { useSearchParams } from "react-router";
import { type RangeValue } from "@react-types/shared";
import Card from "@/ui/components/card";
import { StatisticsApi, type UserMonthStatisticsResponse } from "@/lib/api";
import client from "@/lib/api-client";
import TimeBadge from "@/ui/components/time-badge";

const api = new StatisticsApi(undefined, undefined, client);

const DashboardReport: FC = () => {
  const [searchParams] = useSearchParams();
  const [stats, setStats] = useState<UserMonthStatisticsResponse[]>([]);
  const [range, setRange] = useState<RangeValue<DateValue> | null>(null);

  useEffect(() => {
    api
      .statistics(
        range?.end
          ? `${range.end.year}-${range.end.month}-${range.end.day}`
          : searchParams.get("end") ?? undefined,
        range?.start
          ? `${range.start.year}-${range.start.month}-${range.start.day}`
          : searchParams.get("start") ?? undefined
      )
      .then(({ data }) => setStats(data));
  }, [range]);

  return (
    <div className="flex-1">
      <DateRangePicker onChange={(range) => setRange(range)} />
      <TotalTrackedTimeBadge stats={stats} />
      <Report stats={stats} className="mt-6" />
    </div>
  );
};

const TotalTrackedTimeBadge: FC<{ stats: UserMonthStatisticsResponse[] }> = ({
  stats,
}) => {
  const [time, setTime] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const calculated = stats.reduce(
      (acc, item) => {
        acc.current += item.statistics.work_time ?? 0;
        acc.total += item.statistics.work_time ? 8 * 60 * 60 : 0;

        return acc;
      },
      {
        current: 0,
        total: 0,
      }
    );

    setTime(calculated);
  }, [stats]);

  if (time.current === 0) return;

  return (
    <Card className="rounded-full mt-6 text-gray w-fit" size="sm">
      <span>Visits: </span>
      <TimeBadge ms={time.current * 1000} options={{ roundHours: false }} />
      <span> / </span>
      <TimeBadge ms={time.total * 1000} options={{ roundHours: false }} />
    </Card>
  );
};

export default DashboardReport;
