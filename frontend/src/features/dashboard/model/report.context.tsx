import { useDashboard } from "@/features/dashboard/model/dashboard.context";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import moment from "moment";
import { createContext, useContext, type FC, type PropsWithChildren } from "react";

const ReportContext = createContext<{ sessions: ApiSchema["UserMonthStatisticsResponse"][] }>({ sessions: [] });

export const ReportProvider: FC<PropsWithChildren> = ({ children }) => {
  const { dateRange } = useDashboard();

  const start = moment(dateRange?.from ?? moment().startOf("month")).format("YYYY-MM-DD");
  const end = moment(dateRange?.to ?? moment().endOf("month")).format("YYYY-MM-DD");

  const enabled = Boolean(start && end);

  const { data: sessions } = rqClient.useQuery(
    "get",
    "/api/v1/visits/stats/me",
    {
      params: {
        query: { start, end },
      },
    },
    { enabled }
  );

  return <ReportContext.Provider value={{ sessions: sessions }}>{children}</ReportContext.Provider>;
};

export const useReport = () => useContext(ReportContext);
