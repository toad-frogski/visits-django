import { useEffect, useState, type FC } from "react";
import { VisitsApi, type UserSession } from "@/lib/api";
import client from "@/lib/api-client";
import UserCard from "@/ui/user-card";
import { useWebSocket } from "@/lib/hooks/useWebsocket";
import useAuthStore from "@/stores/auth";

const api = new VisitsApi(undefined, undefined, client);

const List: FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const user = useAuthStore((state) => state.user);
  const fetchUser = useAuthStore((state) => state.fetchUser);

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
    api.today().then(({ data }) => setSessions(data));
  }, []);

  useEffect(() => {}, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-4 p-3 md:p-6">
      {sessions.map(({ user, session }) => (
        <UserCard key={user.id} user={user} session={session} />
      ))}
    </section>
  );
};

export default List;
