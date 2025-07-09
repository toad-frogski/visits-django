import Timer from "@/shared/components/widgets/timer";
import { useVisitsTimer } from "../model/use-visits-timer";
import type { FC } from "react";
import { CONFIG } from "@/shared/model/config";

const VisitsTimer: FC = () => {
  const { current, extra, status } = useVisitsTimer();

  return (
    <Timer
      className="w-full"
      current={current}
      extra={extra}
      total={CONFIG.SESSION_DEFAULT_DURATION || 8 * 60 * 60 * 1000}
      circleClassName={status === "cheater" ? "stroke-destructive" : "stroke-primary"}
    />
  );
};

export default VisitsTimer;
