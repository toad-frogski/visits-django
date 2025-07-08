import { Button } from "@/shared/components/ui/button";
import { Play, RefreshCcw, Ban, Coffee, Pencil, ArrowLeft } from "lucide-react";
import {
  useActiveControlExit,
  useActiveControlLeave,
  useActiveControlMark,
  useSessionCheater,
  useSessionCheaterItem,
  useSessionControl,
  useSessionInactive,
} from "../model/use-visits-session-controller";
import { useEffect, useMemo, type FC } from "react";
import type { ApiSchema } from "@/shared/api/schema";
import { Input } from "@/shared/components/ui/input";
import { formatTime } from "@/shared/lib/utils";
import { ActiveControlProvider, useActiveControl } from "../model/active-control.context";
import { Form, FormField, FormItem, FormMessage } from "@/shared/components/ui/form";

const SessionControl: FC = () => {
  const { session } = useSessionControl();

  switch (session?.status) {
    case "active":
      return (
        <ActiveControlProvider>
          <ActiveControl />
        </ActiveControlProvider>
      );

    case "cheater":
      return <CheaterControl />;

    default:
    case "inactive":
      return <InactiveControl />;
  }
};

const InactiveControl: FC = () => {
  const { status, leave, enter, leaveIsPending, enterIsPending } = useSessionInactive();

  switch (status) {
    case "new":
      return (
        <Button className="w-full justify-start" disabled={enterIsPending} onClick={enter}>
          <Play /> Начать
        </Button>
      );

    case "comeback":
      return (
        <Button className="w-full justify-start" disabled={leaveIsPending} onClick={leave}>
          <RefreshCcw /> Возобновить
        </Button>
      );
  }
};

const CheaterControl: FC = () => {
  const { entries } = useSessionCheater();

  const cheaterActionControls = useMemo(() => entries.map((entry) => <CheaterItemControl entry={entry} />), [entries]);

  return (
    <div className="flex gap-3 flex-col lg:flex-row items-center">
      <p className="text-gray font-semibold flex-1 text-center">
        Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода
      </p>
      <div className="flex-1 space-y-4">{cheaterActionControls}</div>
    </div>
  );
};

const CheaterItemControl: FC<{ entry: ApiSchema["SessionEntryModel"] }> = ({ entry }) => {
  const { endTime, setEndTime, submit, isPending, error } = useSessionCheaterItem();

  return (
    <div className="flex gap-3">
      <label>
        <div className="flex gap-3 items-center">
          {(() => {
            const time = new Date(entry.start!);
            return <Input type="time" readOnly value={formatTime(time.getHours(), time.getMinutes())} />;
          })()}
          <span>-</span>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        {error && <p className="text-destructive">{error}</p>}
      </label>
      <Button disabled={isPending} onClick={() => submit(entry)}>
        Подтвердить
      </Button>
    </div>
  );
};

const ActiveControl: FC = () => {
  const { step, setStep } = useActiveControl();

  if (step.step === "select") {
    return (
      <div>
        <p className="text-lg font-bold">Выберите тип действия</p>
        <div className="flex gap-3 mt-3 flex-col md:flex-row">
          <Button variant="destructive" className="flex-1" onClick={() => setStep({ step: "form", type: "exit" })}>
            <Ban />
            Завершить сессию
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setStep({ step: "form", type: "leave" })}>
            <Coffee /> Отлучиться
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => setStep({ step: "form", type: "mark" })}>
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
        return <ActiveControlExit />;

      case "mark":
        return <ActiveControlMark />;

      case "leave":
        return <ActiveControlLeave />;
    }
  }
};

const ActiveControlExit: FC = () => {
  const { comment, setComment, needsComment, exit, isPending, back } = useActiveControlExit();

  useEffect(() => {
    if (!needsComment) {
      exit();
      back();
    }
  }, [needsComment, exit, back]);

  if (needsComment) {
    return (
      <div>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Отметьте причину выхода"
          className="mt-3"
        />
        <Button disabled={!comment || isPending} className="mt-3 w-full" onClick={exit}>
          Отправить
        </Button>
        <Button className="mt-9 w-full" onClick={back} variant="outline">
          <ArrowLeft /> Вернуться
        </Button>
      </div>
    );
  }

  return null;
};

const ActiveControlMark: FC = () => {
  const { form, back, submit } = useActiveControlMark();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <h1>Отметьте время</h1>
        <div className="flex gap-3 items-center mt-3">
          <FormField
            name="start"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <Input {...field} type="time" aria-label="start" />
                <FormMessage />
              </FormItem>
            )}
          />

          <span> - </span>

          <FormField
            name="end"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <Input {...field} type="time" aria-label="end" />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-3">
          <FormField
            name="comment"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <Input {...field} placeholder="Комментарий" aria-label="comment" />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full mt-3">
          Отправить
        </Button>
      </form>

      <Button className="mt-9 w-full" onClick={back} variant="outline">
        <ArrowLeft /> Вернуться
      </Button>
    </Form>
  );
};

const ActiveControlLeave: FC = () => {
  const { back } = useActiveControlLeave();

  return (
    <Form>
      <form>
        
      </form>
      <Button className="mt-9 w-full" onClick={back} variant="outline">
        <ArrowLeft /> Вернуться
      </Button>
    </Form>
  );
};

export default SessionControl;
