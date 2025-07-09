import type { FC } from "react";
import { useReport } from "../model/use-report";
import type { ApiSchema } from "@/shared/api/schema";
import { cn } from "@/shared/lib/utils";
import { Home } from "lucide-react";

const Report: FC = () => {
  const { sessions } = useReport();

  return (
    <div className="flex flex-col gap-3">
      {sessions?.map((session) => (
        <ReportItem {...session} />
      ))}
    </div>
  );
};

const ReportItem: FC<ApiSchema["UserMonthStatisticsResponse"]> = ({ date, session, statistics, extra }) => {
  const isHoliday = extra.find((e) => e.type === "holidays");

  return (
    <div className={cn("rounded-md py-2 px-4 pl-8 w-full flex gap-3 relative", isHoliday ? "bg-accent" : "bg-card")}>
      {isHoliday && <Home className="absolute left-2 size-4 -translate-y-1/2 top-1/2" />}
      <span>{date}</span>
    </div>
  );
};

export default Report;
