import { useEffect, useState, type FC } from "react";
import { UsersApi } from "../lib/api";
import client from "../lib/api-client";
import Card from "../ui/components/card";

const api = new UsersApi(undefined, undefined, client);

const Home: FC = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.v1UserTodayRetrieve().then(({ data }) => setSessions(data));
  }, []);

  // @todo user card + session status + avatar loader
  return (
    <div className="p-6">
      {sessions.map(({ user, session }) => (
        <Card key={user.id}>
          <img src={user.avatar} className="w-12 h-12 rounded-full object-center" />
        </Card>
      ))}
    </div>
  );
};

export default Home;
