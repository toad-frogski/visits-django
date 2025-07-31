import { useDashboard } from "@/features/dashboard/model/dashboard.context";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { useVisitsSession } from "@/shared/model/visits-session";
import moment from "moment";
import { createContext, useContext, useEffect, type FC, type PropsWithChildren } from "react";

const ReportContext = createContext<{ sessions: ApiSchema["UserMonthStatisticsResponse"][] }>({ sessions: [] });

export const ReportProvider: FC<PropsWithChildren> = ({ children }) => {
  const { dateRange, user } = useDashboard();
  const session = useVisitsSession((state) => state.session);

  const start = moment(dateRange?.from ?? moment().startOf("month")).format("YYYY-MM-DD");
  const end = moment(dateRange?.to ?? moment().endOf("month")).format("YYYY-MM-DD");

  const enabled = Boolean(start && end);

  const { data: sessions, refetch } = rqClient.useQuery(
    "get",
    "/api/v1/visits/stats/{user_id}",
    {
      params: {
        query: { start, end },
        path: { user_id: user!.id },
      },
    },
    { enabled }
  );

  useEffect(() => {
    refetch();
  }, [session, refetch]);

  return <ReportContext.Provider value={{ sessions: sessions ?? [] }}>{children}</ReportContext.Provider>;
};

export const useReport = () => useContext(ReportContext);
