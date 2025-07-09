import type { FC } from "react";
import { Calendar as UICalendar } from "@/shared/components/ui/calendar";
import { useDashboard } from "@/features/dashboard/model/dashboard.context";

const Calendar: FC = () => {
  const { dateRange, setDateRange } = useDashboard();

  return (
    <UICalendar className="rounded-lg border shadow-sm" mode="range" selected={dateRange} onSelect={setDateRange} />
  );
};

export default Calendar;
