import { type FC } from "react";
import Timer from "@/shared/components/widgets/timer";
import { CONFIG } from "@/shared/model/config";
import { useRedmineTimer } from "../model/use-redmine-timer";

const RedmineTimer: FC = () => {
  const { current } = useRedmineTimer();

  return <Timer className="w-full" circleClassName="stroke-secondary-foreground" current={current} total={CONFIG.SESSION_DEFAULT_DURATION || 8 * 60 * 60 * 1000} />;
};

export default RedmineTimer;
