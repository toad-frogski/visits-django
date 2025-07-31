import type { ApiSchema } from "@/shared/api/schema";
import { useDateRangeQueryParams } from "@/shared/hooks/use-date-range-query";
import { useSession } from "@/shared/model/session";
import { createContext, useContext, useMemo, useState, type FC, type PropsWithChildren } from "react";
import type { DateRange } from "react-day-picker";

const DashboardContext = createContext<{
  dateRange: DateRange | undefined;
  setDateRange: (range?: DateRange) => void;
  user?: ApiSchema["UserModel"];
  setUser: (user?: ApiSchema["UserModel"]) => void;
}>({ dateRange: undefined, setDateRange: () => {}, user: undefined, setUser: () => {} });

export const DashboardProvider: FC<PropsWithChildren> = ({ children }) => {
  const { dateRange, setDateRange } = useDateRangeQueryParams();
  const current = useSession((state) => state.user);
  const [user, setUser] = useState(current);

  const value = useMemo(() => ({ dateRange, setDateRange, user, setUser }), [dateRange, setDateRange, user]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => useContext(DashboardContext);
