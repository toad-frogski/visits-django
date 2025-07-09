import { useDashboard } from "@/features/dashboard/model/dashboard.context";
import { rqClient } from "@/shared/api/instance";
import moment from "moment";

export const useReport = () => {
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

  return { sessions };
};
