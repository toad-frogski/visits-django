import { TimeInput } from "@/ui/components/input";
import SessionControl from "@/ui/widgets/session-control";
import type { FC } from "react";

const General: FC = () => {
  return (
    <div className="flex-1">
      <SessionControl />
      <TimeInput />
    </div>
  );
};

export default General;
