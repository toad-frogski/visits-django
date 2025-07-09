import { useSessionControl } from "../model/session-control.context";
import { useActiveControl } from "../model/active-control.context";
import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { CONFIG } from "@/shared/model/config";
import { useVisitsSession } from "@/shared/model/visits-session";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z, { ZodType } from "zod";

export function useSessionControlRoot() {
  const session = useVisitsSession((state) => state.session);
  const fetchSession = useVisitsSession((state) => state.fetchSession);

  useEffect(() => {
    if (!session) fetchSession();
  }, []);

  return { session };
}

export function useSessionInactive() {
  const session = useVisitsSession((state) => state.session);
  const fetchSession = useVisitsSession((state) => state.fetchSession);
  const { setOpen } = useSessionControl();

  const status = useMemo(() => {
    if (!session || session.entries.length === 0) return "new";

    const last = session.entries[session.entries.length - 1];
    if (last.type !== "WORK" && !last.end) return "comeback";

    return "restore";
  }, [session]);

  const leaveMutation = rqClient.useMutation("post", "/api/v1/visits/leave", {
    onSuccess() {
      setOpen(false);
      fetchSession();
    },
  });

  const enterMutation = rqClient.useMutation("post", "/api/v1/visits/enter", {
    onSuccess() {
      setOpen(false);
      fetchSession();
    },
  });

  const leave = () => leaveMutation.mutate({ body: { type: "WORK" } });
  const enter = () => enterMutation.mutate({ body: { type: "WORK" } });

  useEffect(() => {
    if (!session) fetchSession();
  }, [session, fetchSession]);

  return {
    session,
    status,
    leave,
    enter,
    leaveIsPending: leaveMutation.isPending,
    leaveError: leaveMutation.error,
    enterIsPending: enterMutation.isPending,
    enterError: enterMutation.error,
  };
}

export function useSessionCheater() {
  const session = useVisitsSession((state) => state.session);
  const [entries, setEntries] = useState<ApiSchema["SessionEntryModel"][]>([]);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!session) return;

    setEntries(() => {
      return session.date === today
        ? session.entries.filter((entry, i) => !entry.end && i !== session.entries.length - 1)
        : session.entries.filter((entry) => !entry.end);
    });
  }, [session, today]);

  return { entries };
}

export function useSessionCheaterItem() {
  const fetchSession = useVisitsSession((state) => state.fetchSession);
  const [endTime, setEndTime] = useState("");
  const { setOpen } = useSessionControl();

  const { mutate, isPending, error } = rqClient.useMutation("post", "/api/v1/visits/session-entry/{id}/cheater", {
    onSuccess() {
      setOpen(false);
      fetchSession();
    },
  });

  const updateEntry = (id: number, data: ApiSchema["SessionEntryModelRequest"]) =>
    mutate({ params: { path: { id: id } }, body: data });

  const getError = useMemo(() => {
    if (!error) return "";
    if (error instanceof Array && typeof error[0] === "string") return error[0];

    return "Undefined error";
  }, [error]);

  const handleSubmit = (entry: ApiSchema["SessionEntryModel"]) => {
    if (!endTime) return;

    const [hours, minutes] = endTime.split(":").map(Number);

    const end = new Date(entry.start!);
    end.setHours(hours);
    end.setMinutes(minutes);
    end.setSeconds(0);
    end.setMilliseconds(0);

    updateEntry(entry.id, { end: end.toISOString() });
  };

  return {
    endTime,
    setEndTime,
    submit: handleSubmit,
    isPending,
    error: getError,
  };
}

export const useActiveControlExit = () => {
  const fetchSession = useVisitsSession((state) => state.fetchSession);
  const { setStep } = useActiveControl();
  const { setOpen } = useSessionControl();
  const [comment, setComment] = useState("");
  const now = new Date();
  const needsComment = now.getHours() < (CONFIG.SESSION_DEFAULT_END_TIME || 18);

  const back = () => setStep({ step: "select" });

  const { mutate, isPending, error } = rqClient.useMutation("put", "/api/v1/visits/exit", {
    onSuccess() {
      setOpen(false);
      fetchSession();
    },
  });

  const exit = () => mutate({ body: { comment: comment, end: new Date().toISOString() } });

  return { comment, setComment, needsComment, exit, isPending, error, back };
};

export const useActiveControlMark = () => {
  const fetchSession = useVisitsSession((state) => state.fetchSession);
  const { setOpen } = useSessionControl();
  const session = useVisitsSession((state) => state.session)!;
  const activeControlMarkSchema = z
    .object({
      start: z.string({ required_error: "Укажите время начала" }),
      end: z.string({ required_error: "Укажите время окончания" }),
      comment: z.string({ required_error: "Укажите комментарий" }),
    })
    .transform((data) => {
      const [startHour, startMinute] = data.start.split(":").map(Number);
      const [endHour, endMinute] = data.end.split(":").map(Number);

      const now = new Date();
      const startDate = new Date(now);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(now);
      endDate.setHours(endHour, endMinute, 0, 0);

      if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      return {
        ...data,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      };
    });

  const form = useForm({ resolver: zodResolver(activeControlMarkSchema) });

  const { setStep } = useActiveControl();
  const back = () => setStep({ step: "select" });

  const { mutate, isPending, error } = rqClient.useMutation(
    "post",
    "/api/v1/visits/{session_id}/session-entry/create",
    {
      onSuccess() {
        setOpen(false);
        fetchSession();
      },
    }
  );

  const submit = (data: ApiSchema["SessionEntryModelRequest"]) =>
    mutate({ body: data, params: { path: { session_id: session.id } } });

  return { form, back, submit, isPending, error };
};

export const useActiveControlLeave = () => {
  const fetchSession = useVisitsSession((state) => state.fetchSession);
  const { setOpen } = useSessionControl();
  const { setStep } = useActiveControl();
  const back = () => setStep({ step: "select" });

  const activeControlLeaveSchema = z
    .object({
      type: z.enum(["LUNCH", "WORK", "BREAK"], { required_error: "Укажите тип выхода" }),
      comment: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.type === "BREAK" && !data.comment) {
        ctx.addIssue({
          path: ["comment"],
          code: z.ZodIssueCode.custom,
          message: "Комментарий не указан",
        });
      }
    }) satisfies ZodType<ApiSchema["SessionEntryLeaveRequest"]>;

  const form = useForm({ resolver: zodResolver(activeControlLeaveSchema) });

  const { mutate, error, isPending } = rqClient.useMutation("post", "/api/v1/visits/leave", {
    onSuccess() {
      setOpen(false);
      fetchSession();
    },
  });

  const submit = (data: ApiSchema["SessionEntryLeaveRequest"]) =>
    mutate({ body: { ...data, time: new Date().toISOString() } });

  return { back, form, submit, error, isPending };
};
