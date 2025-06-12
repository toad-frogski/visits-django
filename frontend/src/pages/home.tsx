import { useEffect, useState, type FC } from "react";
import { UsersApi } from "../lib/api";
import client from "../lib/api-client";

const api = new UsersApi(undefined, undefined, client);

const Home: FC = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    api.v1UserTodayRetrieve().then(({ data }) => setSessions(data));
  }, []);

  // @todo user card + session status + avatar loader
  return (
    <div className="p-6">
      {sessions.map(({user, session}) => (
        <div key={user.id} className="max-w-[250px] px-4 py-6 rounded-3xl bg-surface shadow">
          <div>
            <img src={user.avatar} className="w-6 h-6 rounded-full object-center" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
