import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

export const useRfid = () => {
  const { data: rfid, isLoading, error, refetch } = rqClient.useQuery("get", "/api/v1/rfid/rfid");
  const [t] = useTranslation("settings");

  const {
    mutate,
    error: saveError,
  } = rqClient.useMutation("put", "/api/v1/rfid/rfid", {
    onSuccess() {
      refetch();
      toast(t("rfidForm.toast"));
    },
  });

  const setRfid = (data: ApiSchema["RFIDSettingsModelRequest"]) => {
    mutate({ body: data });
  };

  const schema = z.object({
    rfid_token: z.string(),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      rfid_token: "",
    },
  });

  useEffect(() => {
    if (rfid?.rfid_token) {
      form.reset({ rfid_token: rfid.rfid_token });
    }
  }, [rfid, form]);

  useEffect(() => {
    if (!saveError) return;

    form.setError("rfid_token", {
      type: "server",
      message: t("rfidForm.errors.save"),
    });
  }, [saveError, form, t]);

  const onSubmit = form.handleSubmit(setRfid);

  return {
    rfid,
    isLoading,
    error,
    saveError,
    form,
    onSubmit
  };
};
