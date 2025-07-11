import { cn } from "@/shared/lib/utils";
import SessionControl from "./visits-session-controller";
import type { FC } from "react";

const VisitsSessionButton: FC = () => {
  return (
    <SessionControl>
      {(status) => (
        <div className="size-full p-2 cursor-pointer">
          <div
            className={cn("rounded-md h-4 min-w-4", {
              "bg-muted": status === "inactive",
              "bg-primary": status === "active",
              "bg-destructive": status === "cheater",
            })}
          />
        </div>
      )}
    </SessionControl>
  );
};

export default VisitsSessionButton;
