import { useState, type FC } from "react";
import Button from "@/ui/components/button";
import useAuthStore from "@/stores/auth";
import { TextInput } from "@/ui/components/input";
import { cn } from "@/lib/cn";
import Card from "@/ui/components/card";
import TimeInput from "@/ui/components/time-input";
import type { Time } from "@internationalized/date";

import client from "@/lib/api-client";
import { TypeB70Enum, VisitsApi } from "@/lib/api";

import Play from "@/assets/play.svg?react";
import House from "@/assets/house.svg?react";
import Coffee from "@/assets/coffee.svg?react";
import Pencil from "@/assets/pencil.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Soup from "@/assets/soup.svg?react";
import Reset from "@/assets/timer-reset.svg?react";
import { ToggleButton, ToggleButtonGroup } from "@/ui/components/toggle-button";
import { Radio, RadioGroup } from "react-aria-components";

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

type ActionType = "mark" | "leave";

const ActiveControl: FC = () => {
  const fetchSession = useAuthStore((state) => state.fetchSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [actionType, setActionType] = useState<Set<ActionType>>(new Set(["leave"]));
  const [leaveType, setLeaveType] = useState<TypeB70Enum | null>(null);
  const [breakMessage, setBreakMessage] = useState("");

  const handleLeaveSubmit = () => {
    if (!actionType.has("leave")) return;

    switch (leaveType) {
      case "BREAK":
        api
          .leave({ comment: breakMessage, type: "BREAK" })
          .then(() => fetchSession())
          .catch(() => setError("Something went wrong"))
          .finally(() => setLoading(false));
        break;

      case "LUNCH":
        api
          .leave({ type: "LUNCH" })
          .then(() => fetchSession())
          .catch(() => setError("Something went wrong"))
          .finally(() => setLoading(false));
        break;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row md:gap-9 gap-6 flex-wrap md:min-h-56">
      <div className="flex flex-col">
        <p className="text-lg font-bold">Выберите тип действия</p>
        <ToggleButtonGroup
          className="gap-3 flex-1 justify-between"
          defaultSelectedKeys={actionType}
          disallowEmptySelection
          selectedKeys={actionType}
          onSelectionChange={(keys) => setActionType(keys as Set<ActionType>)}
        >
          <Button
            icon={House}
            variant="white"
            className="mt-3"
            onClick={() => {
              setLoading(true);
              api
                .exit()
                .then(() => fetchSession())
                .finally(() => setLoading(false));
            }}
          >
            Завершить сессию
          </Button>
          <ToggleButton id="mark" icon={Pencil}>
            Отметить выход
          </ToggleButton>
          <ToggleButton id="leave" icon={Coffee}>
            Выйти
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      {actionType.has("leave") && (
        <div className="flex-1 flex flex-col">
          <p className="text-lg font-bold">Выберите тип выхода</p>
          <RadioGroup onChange={(value) => setLeaveType(value as TypeB70Enum)} className="flex-1">
            <Radio
              className={({ isSelected }) =>
                cn("flex gap-3 mt-3", isSelected ? "text-accent *:stroke-accent" : "text-gray")
              }
              value={TypeB70Enum.Lunch}
            >
              <Soup width={24} height={24} />
              <span>Обед</span>
            </Radio>
            <Radio
              className={({ isSelected }) =>
                cn("flex gap-3 mt-3", isSelected ? "text-accent *:stroke-accent" : "text-gray")
              }
              value={TypeB70Enum.Break}
            >
              <Leaf width={24} height={24} />
              <span>Перерыв</span>
            </Radio>
          </RadioGroup>

          {leaveType === "BREAK" && (
            <TextInput
              className="mt-3"
              placeholder="Отметьте причину"
              value={breakMessage}
              onChange={(e) => setBreakMessage(e.target.value)}
            />
          )}

          <Button
            className="mt-3"
            variant="green"
            disabled={(leaveType === "BREAK" && !breakMessage) || loading || !leaveType}
            onClick={handleLeaveSubmit}
          >
            Подтвердить
          </Button>
        </div>
      )}
      {actionType.has("mark") && (
        <div className="flex items-center justify-center border-dashed border-2 rounded border-accent flex-1">
          <span>Work in progress</span>
        </div>
      )}
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
