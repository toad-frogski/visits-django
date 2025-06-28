import { useEffect, useMemo, useState, type FC } from "react";
import { ToggleButton, ToggleButtonGroup } from "@/ui/components/toggle-button";
import Radio, { RadioGroup } from "@/ui/components/radio";
import { Time } from "@internationalized/date";
import { type RangeValue } from "@react-types/shared";
import { isAxiosError } from "axios";
import { useToast } from "@/ui/components/toast";
import Button from "@/ui/components/button";
import TimeInput from "@/ui/components/time-input";
import useAuthStore from "@/stores/auth";
import { ErrorMessage, TextInput } from "@/ui/components/input";
import { TypeB70Enum, VisitsApi, type SessionEntryModel } from "@/lib/api";
import client from "@/lib/api-client";

import Play from "@/assets/play.svg?react";
import House from "@/assets/house.svg?react";
import Coffee from "@/assets/coffee.svg?react";
import Pencil from "@/assets/pencil.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Soup from "@/assets/soup.svg?react";
import Reset from "@/assets/timer-reset.svg?react";
import Card from "@/ui/components/card";
import { formatTime } from "@/lib/utils";

const api = new VisitsApi(undefined, undefined, client);

const General: FC = () => {
  return (
    <div className="flex-1">
      <Card className="rounded h-fit w-full">
        <SessionControl />
      </Card>
    </div>
  );
};

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
  const session = useAuthStore((state) => state.session);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { addToast } = useToast();

  const [actionType, setActionType] = useState<Set<ActionType>>(
    new Set(["leave"])
  );
  const [leaveType, setLeaveType] = useState<TypeB70Enum | null>(null);
  const [comment, setComment] = useState("");
  const [range, setRange] = useState<RangeValue<Time | null>>();

  const handleLeaveSubmit = () => {
    if (!actionType.has("leave")) return;

    switch (leaveType) {
      case "BREAK":
        api
          .leave({ comment: comment, type: "BREAK" })
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

  const handleMarkSubmit = () => {
    if (!range?.start || !range.end) return;

    if (range.start > range.end) {
      setError("Укажите правильный промежуток");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    setLoading(true);
    api
      .createEntry(session!.id, {
        start: today + "T" + range.start.toString(),
        end: today + "T" + range.end.toString(),
        type: "BREAK",
        comment: comment,
      })
      .then(() => {
        fetchSession();
        setError("");
        setComment("");
        setRange({ start: null, end: null });
        addToast("Запись сохранена");
      })
      .catch((e) => {
        if (isAxiosError(e) && e.status === 400) {
          setError(e.response?.data);
        }
        setError("Что-то пошло не так");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col lg:flex-row md:gap-9 gap-6 flex-wrap">
      <div className="flex flex-col flex-1">
        <p className="text-lg font-bold">Выберите тип действия</p>
        <ToggleButtonGroup
          className="gap-3 flex-1"
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
          <div className="flex-1">
            <RadioGroup
              onChange={(value) => setLeaveType(value as TypeB70Enum)}
              className="flex flex-col gap-3"
              aria-label="leave type"
              value={leaveType}
            >
              <Radio value={TypeB70Enum.Lunch} aria-label="lunch">
                <Soup width={24} height={24} />
                <span>Обед</span>
              </Radio>
              <Radio value={TypeB70Enum.Break} aria-label="break">
                <Leaf width={24} height={24} />
                <span>Перерыв</span>
              </Radio>
            </RadioGroup>

            {leaveType === "BREAK" && (
              <TextInput
                className="mt-3"
                placeholder="Отметьте причину"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            )}
          </div>

          <Button
            className="mt-3"
            variant="green"
            disabled={
              (leaveType === "BREAK" && !comment) || loading || !leaveType
            }
            onClick={handleLeaveSubmit}
          >
            Подтвердить
          </Button>
        </div>
      )}

      {actionType.has("mark") && (
        <div className="flex-1">
          <p className="text-lg font-bold">
            Отметьте время и оставьте комментарий
          </p>
          <div className="flex gap-3 mt-3">
            <TimeInput
              label="От"
              className="w-full"
              hourCycle={24}
              aria-label="start date"
              value={range?.start}
              onChange={(value) => {
                setRange(
                  (prev) => ({ ...prev, start: value } as RangeValue<Time>)
                );
                setError("");
              }}
              color={!!error ? "red" : "accent"}
            />
            <TimeInput
              label="До"
              className="w-full"
              hourCycle={24}
              aria-label="end date"
              value={range?.end}
              onChange={(value) => {
                setRange(
                  (prev) => ({ ...prev, end: value } as RangeValue<Time>)
                );
                setError("");
              }}
              color={!!error ? "red" : "accent"}
            />
          </div>
          {error && <ErrorMessage error={error} />}
          <TextInput
            className="mt-3"
            placeholder="Отметьте причину"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setError("");
            }}
          />
          <Button
            className="mt-3"
            variant="green"
            disabled={loading || !comment}
            onClick={handleMarkSubmit}
          >
            Подтвердить
          </Button>
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
  const [entries, setEntries] = useState<SessionEntryModel[]>([]);

  useEffect(
    () =>
      setEntries(
        () =>
          session?.entries.filter(
            (entry, i) => !entry.end && i !== session.entries.length - 1
          ) ?? []
      ),
    [session]
  );

  const cheaterActionControls = useMemo(
    () => entries.map((entry) => <CheaterItemControl entry={entry} />),
    [entries]
  );

  if (!session) return;

  return (
    <div className="flex gap-3 flex-col lg:flex-row items-center">
      <p className="text-gray font-semibold flex-1 text-center">
        Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода
      </p>
      <div className="flex-1">{cheaterActionControls}</div>
    </div>
  );
};

const CheaterItemControl: FC<{ entry: SessionEntryModel }> = ({ entry }) => {
  const fetchSession = useAuthStore((state) => state.fetchSession);
  const [time, setTime] = useState<Time | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!time) return;

    const start = new Date(entry.start!);
    const [lh, lm] = [start.getHours(), start.getMinutes()];

    if (lh > time!.hour || (lh === time!.hour && lm > time!.minute)) {
      const formatted = formatTime(lh, lm);
      setError(`Время выхода не должно быть раньше ${formatted}`);
      return;
    }

    setLoading(true);
    const end = new Date(start);
    end.setHours(time.hour);
    end.setMinutes(time.minute);
    end.setMilliseconds(0);

    api
      .partialUpdateEntry(entry.id, { end: end.toISOString() })
      .then(() => fetchSession())
      .catch((e) => {
        if (isAxiosError(e) && e.status === 400) {
          setError(e.response?.data);
          return;
        }
        setError("Что-то пошло не так");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex gap-3">
      <div className="flex gap-3 items-center">
        {(() => {
          const startDate = new Date(entry.start!);
          const startTime = new Time(startDate.getHours(), startDate.getMinutes());

          return <TimeInput hourCycle={24} className="flex-1" value={startTime} />;
        })()}
        <span>-</span>
        <TimeInput
          hourCycle={24}
          className="flex-1"
          onChange={(time) => {
            setError("");
            setTime(time);
          }}
          errorMessage={error}
        />
      </div>
      <Button
        className="md:flex-1"
        disabled={loading || !time}
        onClick={handleSubmit}
      >
        Подтвердить
      </Button>
    </div>
  );
};

export default General;
