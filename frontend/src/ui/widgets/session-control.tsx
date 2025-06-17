import { useState, type FC } from "react";
import Button from "@/ui/components/button";
import useAuthStore from "@/stores/auth";
import { TextInput } from "@/ui/components/input";
import { cn } from "@/lib/cn";
import Card from "@/ui/components/card";
import TimeInput from "@/ui/components/time-input";
import type { Time } from "@internationalized/date";

import client from "@/lib/api-client";
import { VisitsApi } from "@/lib/api";

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

    default:
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
  const fetchSession = useAuthStore((state) => state.fetchSession);

  const [time, setTime] = useState<Time | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = () => {
    if (!session) return;
    if (!time) return;

    const last = session.entries[session.entries.length - 1];
    if (!last) return;

    const lastStart = new Date(last.start!);
    const [lh, lm] = [lastStart.getHours(), lastStart.getMinutes()];

    if (lh > time!.hour || (lh === time!.hour && lm > time!.minute)) {
      const formatted = `${String(lh).padStart(2, "0")}:${String(lm).padStart(2, "0")}`;
      setError(`Время выхода не должно быть раньше ${formatted}`);
      return;
    }

    setLoading(true);
    const lastEnd = new Date(lastStart);
    lastEnd.setHours(time.hour);
    lastEnd.setMinutes(time.minute);
    lastEnd.setMilliseconds(0);

    api
      .v1VisitsUpdatePartialUpdate(last.id, { end: lastEnd.toISOString() })
      .then(() => fetchSession())
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  };

  if (!session) return;

  return (
    <div className="flex gap-3 flex-col lg:flex-row items-center">
      <p className="text-gray font-semibold flex-1 text-center">
        Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода
      </p>
      <div className="lg:flex-1 gap-3 flex flex-col xl:flex-row flex-wrap w-full">
        <TimeInput
          hourCycle={24}
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
