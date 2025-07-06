import { useVisitsSession } from "@/features/dashboard/model/visits-session-store";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { useEffect, useMemo, useState } from "react";

export function useSessionControl() {
  const session = useVisitsSession((state) => state.session);
  const fetchSession = useVisitsSession((state) => state.fetchSession);

  useEffect(() => {
    if (!session) fetchSession();
  }, [session]);

  return { session };
}

export function useSessionInactive() {
  const session = useVisitsSession((state) => state.session);
  const fetchSession = useVisitsSession((state) => state.fetchSession);

  const status = useMemo(() => {
    if (!session || !session.entries.length) return "new";

    const last = session.entries[session.entries.length - 1];
    if (last.type !== "WORK" && !last.end) return "comeback";

    return "new";
  }, [session]);

  const leaveMutation = rqClient.useMutation("post", "/api/v1/visits/leave", {
    onSuccess() {
      fetchSession();
    },
  });

  const enterMutation = rqClient.useMutation("post", "/api/v1/visits/enter", {
    onSuccess() {
      fetchSession();
    },
  });

  const leave = () => leaveMutation.mutate({ body: { type: "WORK" } });
  const enter = () => enterMutation.mutate({ body: { type: "WORK" } });

  useEffect(() => {
    if (!session) fetchSession();
  }, [session, fetchSession]);

  return {
    session,
    status,
    leave,
    enter,
    leaveIsPending: leaveMutation.isPending,
    leaveError: leaveMutation.error,
    enterIsPending: enterMutation.isPending,
    enterError: enterMutation.error,
  };
}

export function useSessionCheater() {
  const session = useVisitsSession((state) => state.session);
  const [entries, setEntries] = useState<ApiSchema["SessionEntryModel"][]>([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!session) return;

    setEntries(() => {
      return session.date === today
        ? session.entries.filter(
            (entry, i) => !entry.end && i !== session.entries.length - 1
          )
        : session.entries.filter((entry) => !entry.end);
    });
  }, [session, today]);

  return { entries };
}

export function useSessionCheaterItem() {
  const fetchSession = useVisitsSession((state) => state.fetchSession);
  const [endTime, setEndTime] = useState("");

  const { mutate, isPending, error } = rqClient.useMutation(
    "post",
    "/api/v1/visits/session-entry/{id}/cheater",
    {
      onSuccess() {
        fetchSession();
      },
    }
  );

  const updateEntry = (
    id: number,
    data: ApiSchema["SessionEntryModelRequest"]
  ) => mutate({ params: { path: { id: id } }, body: data });

  const getError = useMemo(() => {
    if (!error) return "";
    if (error instanceof Array && typeof error[0] === "string") return error[0];

    return "Undefined error";
  }, [error]);

  const handleSubmit = (entry: ApiSchema["SessionEntryModel"]) => {
    if (!endTime) return;

    const [hours, minutes] = endTime.split(":").map(Number);

    const end = new Date(entry.start!);
    end.setHours(hours);
    end.setMinutes(minutes);
    end.setSeconds(0);
    end.setMilliseconds(0);

    updateEntry(entry.id, { end: end.toISOString() });
  };

  return {
    endTime,
    setEndTime,
    submit: handleSubmit,
    isPending,
    error: getError,
  };
}

export function useSessionActive() {
  return {}
}