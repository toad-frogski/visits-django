// src/shared/context/dashboard-context.tsx
import { useDateRangeQueryParams } from "./use-date-range-query";
import { createContext, useContext, type FC, type PropsWithChildren } from "react";
import type { DateRange } from "react-day-picker";

const DashboardContext = createContext<{
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
}>({ dateRange: undefined, setDateRange: () => {} });

export const DashboardProvider: FC<PropsWithChildren> = ({ children }) => {
  const { dateRange, setDateRange } = useDateRangeQueryParams();

  return <DashboardContext.Provider value={{ dateRange, setDateRange }}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => useContext(DashboardContext);
