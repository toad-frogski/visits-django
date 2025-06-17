import { useState, type FC } from "react";
import Button from "@/ui/components/button";
import useAuthStore from "@/stores/auth";
import { TextInput } from "@/ui/components/input";
import { cn } from "@/lib/cn";
import Card from "@/ui/components/card";
import TimeInput from "@/ui/components/time-input";
import type { Time } from "@internationalized/date";

import client from "@/lib/api-client";
import { VisitsApi, type SessionModel } from "@/lib/api";

import Pause from "@/assets/pause.svg?react";
import Play from "@/assets/play.svg?react";
import Stop from "@/assets/square.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Soup from "@/assets/soup.svg?react";
import Reset from "@/assets/timer-reset.svg?react";

const api = new VisitsApi(undefined, undefined, client);

const SessionControl: FC = () => {
  const session = useAuthStore((state) => state.session);

  switch (session?.status) {
    case "active":
      return <ActiveControl />;

    case "cheater":
      return <CheaterControl />;

    case "inactive":
      return <InactiveControl />;
  }
};

const ActiveControl: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);
  const [loading, setLoading] = useState(false);

  const [isLeave, setIsLeave] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [breakMessage, setBreakMessage] = useState("");

  const clear = () => {
    setIsLeave(false);
    setIsBreak(false);
    setBreakMessage("");
  };

  return (
    <div className={cn("flex flex-col lg:flex-row items-center justify-center gap-x-3", isLeave && "gap-y-3")}>
      <div className="flex md:flex-col gap-3 w-full">
        {session?.status === "active" && (
          <>
            <Button
              icon={Pause}
              onClick={() => {
                setIsLeave((prev) => !prev);
                if (isLeave) setIsBreak(false);
              }}
            >
              Отлучиться
            </Button>
            <Button
              icon={Stop}
              disabled={loading || isLeave}
              onClick={() => {
                setLoading(true);
                api.exit().finally(() => {
                  setLoading(false);
                  fetchSession();
                  clear();
                });
              }}
            >
              Завершить
            </Button>
          </>
        )}
      </div>

      <div className="flex md:flex-col gap-3 w-full">
        {session?.status === "active" && isLeave && (
          <>
            <Button variant="green" icon={Leaf} onClick={() => setIsBreak((prev) => !prev)}>
              Перерыв
            </Button>
            <Button
              variant="blue"
              icon={Soup}
              disabled={loading || isBreak}
              onClick={() => {
                setLoading(true);
                api.leave({ type: "LUNCH" }).finally(() => {
                  setLoading(false);
                  fetchSession();
                  clear();
                });
              }}
            >
              Обед
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 w-full">
        {session?.status === "active" && isBreak && (
          <>
            <TextInput
              className="max-h-12"
              placeholder="Укажите причину"
              value={breakMessage}
              onChange={(e) => setBreakMessage(e.target.value)}
            />
            <Button
              disabled={loading || !breakMessage}
              onClick={() => {
                setLoading(false);
                api.leave({ type: "BREAK", comment: breakMessage }).finally(() => {
                  setLoading(false);
                  fetchSession();
                  clear();
                });
              }}
            >
              Подтвердить
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

const InactiveControl: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);
  const [loading, setLoading] = useState(false);

  if (!session || !session.entries.length) {
    return (
      <Button
        icon={Play}
        disabled={loading}
        onClick={() => {
          api.enter({ type: "WORK" }).finally(() => fetchSession());
        }}
      >
        Начать
      </Button>
    );
  }

  const last = session.entries[session.entries.length - 1];

  // Handle break comeback.
  if (last.type !== "WORK") {
    return (
      <Button
        icon={Reset}
        disabled={loading}
        onClick={() => {
          api
            .leave({ type: "WORK" })
            .then(() => fetchSession())
            .finally(() => setLoading(false));
        }}
      >
        Возобновить
      </Button>
    );
  }

  return (
    <Button
      icon={Reset}
      disabled={loading}
      onClick={() => {
        api
          .enter({ type: "WORK" })
          .then(() => fetchSession())
          .finally(() => setLoading(false));
      }}
    >
      Возобновить
    </Button>
  );
};

const CheaterControl: FC = () => {
  const session = useAuthStore((state) => state.session);

  const [time, setTime] = useState<Time | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLastDate = (session: SessionModel | null): Date | null => {
    if (!session) return null;

    const last = session?.entries[session.entries.length - 1];
    const lastStart = new Date(last.start!);

    return lastStart;
  };

  const handleSubmit = () => {
    const last = getLastDate(session);

    if (!last) return;

    const [lh, lm] = [last.getHours(), last.getMinutes()];

    if (lh > time!.hour || (lh === time!.hour && lm > time!.minute)) {
      const formatted = `${String(lh).padStart(2, "0")}:${String(lm).padStart(2, "0")}`;
      setError(`Время выхода не должно быть раньше ${formatted}`);
      return;
    }

    setLoading(true);
  };

  if (!session) return;

  return (
    <div className="flex gap-3 flex-col md:flex-row">
      <p className="text-gray font-semibold flex-1">
        Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода
      </p>
      <div className="lg:flex-1 gap-3 flex flex-col xl:flex-row flex-wrap">
        <TimeInput
          className="md:flex-1"
          onChange={(time) => {
            setError("");
            setTime(time);
          }}
          errorMessage={error}
        />
        <Button className="md:flex-1" disabled={!session || loading || !time} onClick={handleSubmit}>
          Подтвердить
        </Button>
      </div>
    </div>
  );
};

const SessionControlWrapper: FC = () => {
  return (
    <Card className="rounded h-fit w-full">
      <SessionControl />
    </Card>
  );
};

export default SessionControlWrapper;
