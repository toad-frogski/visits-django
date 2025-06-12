import { lazy, useEffect, useState, type FC } from "react";
import { StatusEnum, VisitsApi, type SessionModel } from "../../lib/api";
import client from "../../lib/api-client";
import Button from "../../ui/components/button";

const api = new VisitsApi(undefined, undefined, client);

const Visits: FC = () => {
  const [session, setSession] = useState<SessionModel | null>(null)
  const [sessionStatus, setSessionStatus] = useState<StatusEnum>("inactive");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCurrentSession()
      .then(({ data }) => setSession(data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (session === null) {
      setSessionStatus("inactive")
      return;
    }

    const entries = session.entries;
    const openEntries = entries.filter((entry) => (!entry.check_in || !entry.check_out));
    if (openEntries.length > 1) {
      setSessionStatus("cheater");
      return;
    } else if (openEntries.length === 0) {
      setSessionStatus("inactive");
      return;
    }

    setSessionStatus("active");
  }, [session]);

  if (loading) return null;

  switch (sessionStatus) {
    case "inactive":
      return <Button
        onClick={async () => {
          try {
            await api.enter();
            const { data } = await api.getCurrentSession();

            setSession(data);
          } catch {
          }
        }}
      >Отметить вход</Button>

    case "active":
      return <Button onClick={async () => {
        const [entry] = session!.entries.filter((entry) => (!entry.check_in || !entry.check_out));
        try {
          await api.updateExit({ id: entry.id });
          const { data } = await api.getCurrentSession();

          setSession(data);
        } catch {
        }
      }}>Отметить выход</Button>

  }
}

export default Visits;