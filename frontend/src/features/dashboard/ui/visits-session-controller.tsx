import { Button } from "@/shared/components/ui/button";
import { Play, RefreshCcw, Ban, Coffee, Pencil } from "lucide-react";
import {
  useSessionActive,
  useSessionCheater,
  useSessionCheaterItem,
  useSessionControl,
  useSessionInactive,
} from "../model/use-visits-session-controller";
import { useMemo, useState, type FC } from "react";
import type { ApiSchema } from "@/shared/api/schema";
import { Input } from "@/shared/components/ui/input";
import { formatTime } from "@/shared/lib/utils";
import { Card, CardContent } from "@/shared/components/ui/card";

const SessionControl: FC = () => {
  const { session } = useSessionControl();

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

const InactiveControl: FC = () => {
  const { status, leave, enter, leaveIsPending, enterIsPending } =
    useSessionInactive();

  switch (status) {
    case "new":
      return (
        <Button
          className="w-full justify-start"
          disabled={enterIsPending}
          onClick={enter}
        >
          <Play /> Начать
        </Button>
      );

    case "comeback":
      return (
        <Button
          className="w-full justify-start"
          disabled={leaveIsPending}
          onClick={leave}
        >
          <RefreshCcw /> Возобновить
        </Button>
      );
  }
};

const CheaterControl: FC = () => {
  const { entries } = useSessionCheater();

  const cheaterActionControls = useMemo(
    () => entries.map((entry) => <CheaterItemControl entry={entry} />),
    [entries]
  );

  return (
    <div className="flex gap-3 flex-col lg:flex-row items-center">
      <p className="text-gray font-semibold flex-1 text-center">
        Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода
      </p>
      <div className="flex-1 space-y-4">{cheaterActionControls}</div>
    </div>
  );
};

const CheaterItemControl: FC<{ entry: ApiSchema["SessionEntryModel"] }> = ({
  entry,
}) => {
  const { endTime, setEndTime, submit, isPending, error } =
    useSessionCheaterItem();

  return (
    <div className="flex gap-3">
      <label>
        <div className="flex gap-3 items-center">
          {(() => {
            const time = new Date(entry.start!);
            return (
              <Input
                type="time"
                readOnly
                value={formatTime(time.getHours(), time.getMinutes())}
              />
            );
          })()}
          <span>-</span>
          <Input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
        {error && <p className="text-destructive">{error}</p>}
      </label>
      <Button disabled={isPending} onClick={() => submit(entry)}>
        Подтвердить
      </Button>
    </div>
  );
};

type ActiveControlStep =
  | { step: "select" }
  | { step: "form"; type: "exit" | "leave" | "mark" };

const ActiveControl: FC = () => {
  const {} = useSessionActive();
  const [step, setStep] = useState<ActiveControlStep>({ step: "select" });

  if (step.step === "select") {
    return (
      <div>
        <p className="text-lg font-bold">Выберите тип действия</p>
        <div className="flex gap-3 mt-3 flex-col md:flex-row">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setStep({ step: "form", type: "exit" })}
          >
            <Ban />
            Завершить сессию
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep({ step: "form", type: "leave" })}
          >
            <Coffee /> Отлучиться
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep({ step: "form", type: "mark" })}
          >
            <Pencil />
            Отлучился, но не отметился
          </Button>
        </div>
      </div>
    );
  }

  if (step.step === "form") {
    switch (step.type) {
      case "exit":
        return;

      case "mark":
        return;

      case "leave":
        return;
    }
  }
};

export default SessionControl;
