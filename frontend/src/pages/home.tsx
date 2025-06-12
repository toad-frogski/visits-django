import { useEffect, useState, type FC } from "react";
import { UsersApi, type UserSession } from "../lib/api";
import client from "../lib/api-client";
import UserCard from "../ui/user-card";

const api = new UsersApi(undefined, undefined, client);

const Home: FC = () => {
  const [sessions, setSessions] = useState<UserSession[]>([]);

  useEffect(() => {
    api.today().then(({ data }) => setSessions(data));
  }, []);

  // @todo user card + session status + avatar loader
  return (
    <div className="p-3 md:p-6">
      <section className="flex flex-col gap-3 md:flex-row flex-wrap">
        {sessions.map((session) => (
          <UserCard {...session} className="md:max-w-[360px]" />
        ))}
      </section>
    </div>
  );
};

export default Home;
