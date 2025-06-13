import { useEffect, type FC } from "react";
import { Outlet } from "react-router";
import Card from "../../ui/components/card";
import Timer from "../../widgets/timer";
import { useSessionStore } from "../../stores/session";
import { VisitsApi } from "../../lib/api";
import client from "../../lib/api-client";

const api = new VisitsApi(undefined, undefined, client);

const Home: FC = () => {
  const session = useSessionStore((state) => state.session);
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    if (!session) {
      api.getCurrentSession().then(({ data }) => setSession(data));
    }
  }, []);

  return (
    <div className="flex gap-12">
      <Card className="flex-2 rounded">
        <Outlet />
      </Card>
      <div className="flex-1">
        <Timer session={session} className="ml-auto" />
      </div>
    </div>
  );
};

export default Home;
