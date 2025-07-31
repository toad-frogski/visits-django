import { useDashboard } from "@/features/dashboard/model/dashboard.context";
import { fetchClient } from "@/shared/api/instance";
import { Button } from "@/shared/components/ui/button";
import { NotebookPenIcon } from "lucide-react";
import moment from "moment";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

const DownloadReport: FC = () => {
  const { dateRange, user } = useDashboard();
  const [t] = useTranslation("dashboard");

  const exportReport = () => {
    const start = moment(dateRange?.from ?? moment().startOf("month")).format("YYYY-MM-DD");
    const end = moment(dateRange?.to ?? moment().endOf("month")).format("YYYY-MM-DD");

    fetchClient
      .GET("/api/v1/visits/stats/export", {
        params: { query: { start: start, end: end, user_id: user?.id } },
        parseAs: "blob",
      })
      .then(({ data }) => {
        if (!data) return;

        const url = URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${user?.full_name}-${start}-${end}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <Button className="w-full" onClick={exportReport}>
      <NotebookPenIcon />
      {t("report.download")}
    </Button>
  );
};

export default DownloadReport;
