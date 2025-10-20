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
import { useMemo, type FC, type ReactNode } from "react";
import type { ApiSchema } from "@/shared/api/schema";
import { Input } from "@/shared/components/ui/input";
import { formatTime } from "@/shared/lib/utils";
import { ActiveControlProvider, useActiveControl } from "../model/active-control.context";
import { SessionControlProvider, useSessionControl } from "../model/session-control.context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";

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
      <DialogContent showCloseButton={false} >
        <VisuallyHidden>
          <DialogTitle>Visits controller</DialogTitle>
          <DialogDescription>Controller for visits session</DialogDescription>
        </VisuallyHidden>
        <div className="p-2">{control}</div>
      </DialogContent>
    </Dialog>
  );
};

const InactiveControl: FC = () => {
  const { status, leave, enter, leaveIsPending, enterIsPending } = useSessionInactive();
  const [t] = useTranslation(["common", "visits-controller"]);

  switch (status) {
    case "restore":
    case "new":
      return (
        <Button className="w-full justify-start" disabled={enterIsPending} onClick={enter}>
          {status === "restore" ? (
            <>
              <RefreshCcw />
              {t("common:resume")}
            </>
          ) : (
            <>
              <Play />
              {t("common:start")}
            </>
          )}
        </Button>
      );

    case "comeback":
      return (
        <Button className="w-full justify-start" disabled={leaveIsPending} onClick={leave}>
          <RefreshCcw /> {t("common:resume")}
        </Button>
      );
  }
};

const CheaterControl: FC = () => {
  const { entries } = useSessionCheater();
  const [t] = useTranslation("visits-controller");

  const cheaterActionControls = useMemo(() => entries.map((entry) => <CheaterItemControl entry={entry} />), [entries]);

  return (
    <div>
      <p className="text-gray text-center">{t("cheater.title")}</p>
      <div className="space-y-4 mt-3 w-full">{cheaterActionControls}</div>
    </div>
  );
};

const CheaterItemControl: FC<{ entry: ApiSchema["SessionEntryModel"] }> = ({ entry }) => {
  const { endTime, setEndTime, submit, isPending, error } = useSessionCheaterItem();
  const [t] = useTranslation("common");

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
        {t("confirm")}
      </Button>
    </div>
  );
};

const ActiveControl: FC = () => {
  const { step, setStep } = useActiveControl();
  const [t] = useTranslation("visits-controller");

  if (step.step === "select") {
    return (
      <div>
        <p className="text-lg font-bold">{t("active.title")}</p>
        <div className="flex gap-3 mt-3 flex-col">
          <Button
            variant="destructive"
            className="flex-1 whitespace-normal"
            onClick={() => setStep({ step: "form", type: "exit" })}
          >
            <Ban />
            {t("active.end")}
          </Button>
          <Button
            variant="outline"
            className="flex-1 whitespace-normal"
            onClick={() => setStep({ step: "form", type: "leave" })}
          >
            <Coffee /> {t("active.break")}
          </Button>
          <Button
            variant="outline"
            className="flex-1 whitespace-normal"
            onClick={() => setStep({ step: "form", type: "mark" })}
          >
            <Pencil />
            {t("active.mark")}
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
  const [t] = useTranslation(["visits-controller", "common"]);

  if (needsComment) {
    return (
      <div>
        <Input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("visits-controller:active.exitForm.commentPlaceholder")}
          className="mt-3"
        />
        <Button disabled={!comment || isPending} className="mt-3 w-full" onClick={exit}>
          {t("common:send")}
        </Button>
        <Button className="mt-9 w-full" onClick={back} variant="outline">
          <ArrowLeft /> {t("common:back")}
        </Button>
      </div>
    );
  }

  return null;
};

const ActiveControlMark: FC = () => {
  const { form, back, submit } = useActiveControlMark();
  const [t] = useTranslation(["visits-controller", "common"]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)}>
        <h1>{t("visits-controller:active.markForm.title")}</h1>
        <div className="flex gap-3 items-center mt-3">
          <FormField
            name="start"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <Input {...field} type="time" aria-label={t("common:start")} />
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
                <Input {...field} type="time" aria-label={t("common:end")} />
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
                <Input {...field} placeholder={t("common:comment")} aria-label={t("common:comment")} />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full mt-3">
          {t("common:send")}
        </Button>
      </form>

      <Button className="mt-9 w-full" onClick={back} variant="outline">
        <ArrowLeft /> {t("common:back")}
      </Button>
    </Form>
  );
};

const ActiveControlLeave: FC = () => {
  const { back, form, isPending, submit } = useActiveControlLeave();
  const [t] = useTranslation("common");

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
                      <Soup /> {t("lunch")}
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center">
                    <FormControl>
                      <RadioGroupItem value="BREAK" />
                    </FormControl>
                    <FormLabel>
                      <Coffee /> {t("break")}
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === "LUNCH" && <Button className="mt-6 w-full">{t("send")}</Button>}

        {type === "BREAK" && (
          <>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <Input {...field} placeholder={t("comment")} className="mt-6" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-3 w-full" disabled={isPending || !comment}>
              {t("send")}
            </Button>
          </>
        )}
      </form>
      <Button className="mt-9 w-full" onClick={back} variant="outline">
        <ArrowLeft /> {t("back")}
      </Button>
    </Form>
  );
};

export default SessionControl;
