import { useEffect, useState, type FC } from "react";
import { VisitsApi, type UserSession } from "@/lib/api";
import client from "@/lib/api-client";
import UserCard from "@/ui/user-card";
import { useWebSocket } from "@/lib/hooks/useWebsocket";

const api = new VisitsApi(undefined, undefined, client);

const List: FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);

  useWebSocket({
    url: `ws://${window.location.host}/api/ws/session/status`,
    handlers: {
      session_update: () => api.today().then(({ data }) => setSessions(data)),
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
