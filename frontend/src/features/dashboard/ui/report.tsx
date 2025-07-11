import { useState, type FC } from "react";
import type { ApiSchema } from "@/shared/api/schema";
import { cn } from "@/shared/lib/utils";
import { Clock, Coffee, Hammer, Home, PartyPopper, Settings, Soup } from "lucide-react";
import TimeBadge from "@/shared/components/ui/time-badge";
import moment from "moment";
import { useReport } from "../model/report.context";

const Report: FC = () => {
  const { sessions } = useReport();

  return (
    <div className="flex flex-col gap-3">
      {sessions?.map((session) => (
        <ReportItem key={session.date} {...session} />
      ))}
    </div>
  );
};

const ReportItem: FC<ApiSchema["UserMonthStatisticsResponse"]> = ({ date, session, statistics, extra }) => {
  const [open, setOpen] = useState(false);
  const holiday = extra.find((e) => e.type === "holidays");

  const clickable = session?.entries && session.entries.length !== 0;

  const handleOpen = () => {
    if (!clickable) return;

    setOpen((prev) => !prev);
  };

  return (
    <div className="rounded-md w-full overflow-hidden relative" data-open={open}>
      <div
        className={cn("absolute h-full w-4 left-0 top-0 rounded-l-md z-10 data-[open=true]:bg-primary")}
        data-open={open}
      />
      <div
        onClick={handleOpen}
        className={cn(
          "flex gap-6 py-2 pr-4 pl-8 relative bg-card data-[special=true]:bg-accent transition-all duration-200 ease",
          clickable && "cursor-pointer hover:bg-accent/80"
        )}
        data-special={Boolean(holiday)}
      >
        <span className="opacity-50 hidden md:inline">{date}</span>
        <span className="opacity-50 md:hidden">{moment(date).format("MM-DD")}</span>
        {session && <StatisticsBadge statistics={statistics} />}
        <ExtraBadge extra={extra} date={date} />
      </div>
      {open && (
        <ul className="bg-card pl-8 pr-4 py-2 space-y-4">
          {session?.entries.map((entry) => (
            <li key={entry.id} className="flex items-center gap-2">
              <span>
                {
                  {
                    WORK: <Hammer className="size-4" />,
                    BREAK: <Coffee className="size-4" />,
                    LUNCH: <Soup className="size-4" />,
                    SYSTEM: <Settings className="size-4" />,
                  }[entry.type ?? "SYSTEM"]
                }
              </span>
              <span>{entry.start ? moment(entry.start).format("HH:mm") : "--:--"}</span>-
              <span>{entry.end ? moment(entry.end).format("HH:mm") : "--:--"}</span>
              {entry.comment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const StatisticsBadge: FC<Pick<ApiSchema["UserMonthStatisticsResponse"], "statistics">> = ({ statistics }) => {
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

const ExtraBadge: FC<Pick<ApiSchema["UserMonthStatisticsResponse"], "extra" | "date">> = ({ extra, date }) => {
  return (
    <div className="flex gap-3 md:ml-auto md:pr-3">
      {extra.map(
        ({ type, payload }) =>
          ({
            redmine: (
              <TimeBadge
                key={`${date}-redmine`}
                ms={(payload as ApiSchema["RedmineExtraFieldPayload"]).hours * 60 * 60 * 1000}
              />
            ),
            holidays: (() => {
              const holidayPayload = payload as ApiSchema["HolidaysExtraFieldPayload"];
              let Icon: FC<React.SVGProps<SVGSVGElement>> | null = null;

              if (holidayPayload.type === "holiday") {
                Icon = PartyPopper;
              } else if (holidayPayload.type === "weekend") {
                Icon = Home;
              }

              return (
                Icon && (
                  <Icon key={`${date}-holiday`} className="absolute left-2 size-4 -translate-y-1/2 top-1/2 z-20" />
                )
              );
            })(),
          }[type])
      )}
    </div>
  );
};

export default Report;
