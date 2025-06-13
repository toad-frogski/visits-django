import { useEffect, useState, type FC } from "react";
import { StatusEnum, VisitsApi, type SessionModel } from "../../lib/api";
import client from "../../lib/api-client";
import Button from "../../ui/components/button";
import { useSessionStore } from "../../stores/session";

const api = new VisitsApi(undefined, undefined, client);

const Visits: FC = () => {
  const session = useSessionStore((state) => state.session);
  const setSession = useSessionStore((state) => state.setSession);

  useEffect(() => {
    if (session) return;

    api
      .getCurrentSession()
      .then(({ data }) => setSession(data))
  }, []);

  return (
    <div>
      <VisitMenu status={session?.status} setSession={setSession} />
    </div>
  );
};

const VisitMenu: FC<{ status?: StatusEnum; setSession: (session: SessionModel) => void }> = ({ status, setSession }) => {
  switch (status) {
    case "inactive":
      return (
        <div>
          <Button
            onClick={() => {
              api.enter({ type: "WORK" }).finally(() => api.getCurrentSession().then(({ data }) => setSession(data)));
            }}
          >
            Войти
          </Button>
        </div>
      );

    case "active":
      return (
        <div className="flex gap-12">
          <Button disabled>Отлучиться</Button>
          <Button
            onClick={() => {
              api.exit().finally(() => api.getCurrentSession().then(({ data }) => setSession(data)));
            }}
          >
            Выйти
          </Button>
        </div>
      );
  }
};

export default Visits;
