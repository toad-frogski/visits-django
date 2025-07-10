import moment from "moment";
import { useReport } from "./report.context";
import { formatTime, parseMs } from "@/shared/lib/utils";
import { useMemo } from "react";
import type { ApiSchema } from "@/shared/api/schema";

export const useVisitsBadge = () => {
  const { sessions } = useReport();

  const time = useMemo(() => {
    if (!sessions) return "";

    const ms = sessions.reduce((acc, session) => {
      if (!session.session || session.session.entries.length === 0) return acc;

      return (
        acc +
        session.session.entries.reduce((entryAcc, entry) => {
          if (!entry.start || !entry.end) return entryAcc;
          if (entry.type !== "WORK") return entryAcc;

          const start = moment(entry.start);
          const end = moment(entry.end);

          if (!start.isValid() || !end.isValid()) return entryAcc;

          return entryAcc + end.diff(start);
        }, 0)
      );
    }, 0);

    if (ms <= 0) return "";

    const parsed = parseMs(ms, { roundHours: false });
    return formatTime(parsed.hours, parsed.minutes);
  }, [sessions]);

  return { time };
};

export const useRedmineBadge = () => {
  const { sessions } = useReport();

  const time = useMemo(() => {
    if (!sessions) return "";

    const ms = sessions.reduce((acc, session) => {
      const redmine = session.extra.find((e) => e.type === "redmine");

      if (!redmine) return acc;

      const redminePayload = redmine.payload as ApiSchema["RedmineExtraFieldPayload"];
      acc += redminePayload.hours * 60 * 60 * 1000;

      return acc;
    }, 0);

    if (ms <= 0) return "";

    return "";
  }, [sessions]);

  return { time };
};
