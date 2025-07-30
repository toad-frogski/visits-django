import type { ApiSchema } from "@/shared/api/schema";
import { useDateRangeQueryParams } from "@/shared/hooks/use-date-range-query";
import { createContext, useContext, type FC, type PropsWithChildren } from "react";
import type { DateRange } from "react-day-picker";

const DashboardContext = createContext<{
  dateRange: DateRange | undefined;
  setDateRange: (range?: DateRange) => void;
  user?: ApiSchema["UserModel"]
}>({ dateRange: undefined, setDateRange: () => {} });

export const DashboardProvider: FC<PropsWithChildren> = ({ children }) => {
  const { dateRange, setDateRange } = useDateRangeQueryParams();

  return <DashboardContext.Provider value={{ dateRange, setDateRange }}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => useContext(DashboardContext);
