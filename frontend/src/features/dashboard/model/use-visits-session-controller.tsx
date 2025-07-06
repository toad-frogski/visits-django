import { useVisitsSession } from "@/features/dashboard/model/visits-session-store";
import { rqClient } from "@/shared/api/instance";
import { useEffect, useMemo } from "react";

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
