import { Button } from "@/shared/components/ui/button";
import { Play, RefreshCcw, Ban, Coffee, Pencil, ArrowLeft, Soup } from "lucide-react";
import {
  useActiveControlExit,
  useActiveControlLeave,
  useActiveControlMark,
  useSessionCheater,
  useSessionCheaterItem,
  useSessionControlRoot,
  useSessionInactive,
} from "../model/use-visits-session-controller";
import { useEffect, useMemo, type FC, type ReactNode } from "react";
import type { ApiSchema } from "@/shared/api/schema";
import { Input } from "@/shared/components/ui/input";
import { formatTime } from "@/shared/lib/utils";
import { ActiveControlProvider, useActiveControl } from "../model/active-control.context";
import { SessionControlProvider, useSessionControl } from "../model/session-control.context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/components/ui/dialog";

type SessionControlProps = {
  children: ((status: ApiSchema["SessionModel"]["status"]) => ReactNode) | ReactNode;
};

const SessionControl: FC<SessionControlProps> = ({ children }) => {
  return (
    <SessionControlProvider>
      <SessionControlRoot>{children}</SessionControlRoot>
    </SessionControlProvider>
  );
};

const SessionControlRoot: FC<SessionControlProps> = ({ children }) => {
  const { session } = useSessionControlRoot();
  const { open, setOpen } = useSessionControl();

  const trigger = typeof children === "function" ? children(session?.status ?? "inactive") : children;

  const control = useMemo(() => {
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
  }, [session?.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <div className="p-2">{control}</div>
      </DialogContent>
    </Dialog>
  );
};

const InactiveControl: FC = () => {
  const { status, leave, enter, leaveIsPending, enterIsPending } = useSessionInactive();

  switch (status) {
    case "restore":
    case "new":
      return (
        <Button className="w-full justify-start" disabled={enterIsPending} onClick={enter}>
          {status === "restore" ? (
            <>
              <RefreshCcw />
              Возобновить
            </>
          ) : (
            <>
              <Play />
              Начать
            </>
          )}
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
    <div>
      <p className="text-gray text-center">Вы ушли и не отметились в системе. Пожалуйста, укажите время выхода</p>
      <div className="space-y-4 mt-3 w-full">{cheaterActionControls}</div>
    </div>
  );
};

const CheaterItemControl: FC<{ entry: ApiSchema["SessionEntryModel"] }> = ({ entry }) => {
  const { endTime, setEndTime, submit, isPending, error } = useSessionCheaterItem();

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        <div className="flex gap-3 items-center">
          {(() => {
            const time = new Date(entry.start!);
            return <Input type="time" readOnly value={formatTime(time.getHours(), time.getMinutes())} />;
          })()}
          <span>-</span>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
        {error && <p className="text-destructive">{error}</p>}
      </div>
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
        <div className="flex gap-3 mt-3 flex-col">
          <Button
            variant="destructive"
            className="flex-1 whitespace-normal"
            onClick={() => setStep({ step: "form", type: "exit" })}
          >
            <Ban />
            Завершить сессию
          </Button>
          <Button
            variant="outline"
            className="flex-1 whitespace-normal"
            onClick={() => setStep({ step: "form", type: "leave" })}
          >
            <Coffee /> Отлучиться
          </Button>
          <Button
            variant="outline"
            className="flex-1 whitespace-normal"
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
  const { back, form, isPending, submit } = useActiveControlLeave();

  const type = form.watch("type");
  const comment = form.watch("comment");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="LUNCH" />
                    </FormControl>
                    <FormLabel>
                      <Soup /> Обед
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="BREAK" />
                    </FormControl>
                    <FormLabel>
                      <Coffee /> Перерыв
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "LUNCH" && <Button className="mt-6 w-full">Отправить</Button>}

        {type === "BREAK" && (
          <>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <Input {...field} placeholder="Комментарий" className="mt-6" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-3 w-full" disabled={isPending || !comment}>
              Отправить
            </Button>
          </>
        )}
      </form>
      <Button className="mt-9 w-full" onClick={back} variant="outline">
        <ArrowLeft /> Вернуться
      </Button>
    </Form>
  );
};

export default SessionControl;
