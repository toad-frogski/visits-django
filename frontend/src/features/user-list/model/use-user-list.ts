import { publicRqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { useWebSocket } from "@/shared/hooks/use-websocket";
import { useSession } from "@/shared/model/session";
import { useEffect, useState } from "react";

export const useUserList = () => {
  const [sessions, setSessions] = useState<ApiSchema["UserSession"][]>([]);
  const user = useSession((state) => state.user);
  const fetchUser = useSession((state) => state.fetchUser);
  const { data, isLoading, error } = publicRqClient.useQuery("get", "/api/v1/visits/today");

  useWebSocket({
    url: `ws://${window.location.host}/api/ws/visits/notifications`,
    handlers: {
      session_status_updated: (payload) =>
        setSessions((prev) =>
          prev.map((session) =>
            session.user.id === payload.user_id
              ? {
                  ...session,
                  session: {
                    ...session.session,
                    status: payload.status,
                    comment: payload.comment,
                  },
                }
              : session
          )
        ),
      user_avatar_changed: (payload) => {
        setSessions((prev) =>
          prev.map((session) =>
            session.user.id === payload.user_id
              ? {
                  ...session,
                  user: {
                    ...session.user,
                    avatar: payload.avatar_url,
                  },
                }
              : session
          )
        );

        if (user?.id === payload.user_id) fetchUser();
      },
    },
  });

  useEffect(() => {
    if (data) {
      setSessions(data);
    }
  }, [data]);

  return {
    sessions,
    isLoading: isLoading,
    error: error ?? undefined,
  };
};
