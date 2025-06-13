import { useEffect, useState, type FC } from "react";
import { VisitsApi, type UserSession } from "../lib/api";
import client from "../lib/api-client";
import UserCard from "../ui/user-card";

const api = new VisitsApi(undefined, undefined, client);

const List: FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);

  useEffect(() => {
    api.today().then(({ data }) => setSessions(data));
  }, []);

  return (
    <section className="flex flex-col gap-3 md:flex-row flex-wrap">
      {sessions.map(({user, session}) => (
        <UserCard key={user.id} user={user} session={session} className="md:max-w-[360px]" />
      ))}
    </section>
  );
};

export default List;
