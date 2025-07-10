import { useRedmineBadge, useVisitsBadge } from "../model/use-report-badges";
import { Badge } from "@/shared/components/ui/badge";
import type { FC } from "react";

const ReportBadges: FC = () => {
  const { time: visits } = useVisitsBadge();
  const { time: redmine} = useRedmineBadge();

  return (
    <div className="mb-4 space-x-4">
      {visits && <Badge className="font-bold">Visits: {visits}</Badge>}
      {redmine && <Badge variant="secondary" className="font-bold">{redmine}</Badge>}
    </div>
  );
};

export default ReportBadges;
