import { TimerBlock } from "@/ui/widgets/timer";
import type { FC } from "react";

const RedmineTimer: FC = () => {
  return <TimerBlock current={0} total={8 * 60 * 60} color="green" />;
};

export default RedmineTimer;
