import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { toast } from "sonner";

export const useRfid = () => {
  const {
    data: rfid,
    isLoading,
    error,
    refetch,
  } = rqClient.useQuery("get", "/api/v1/rfid/rfid");

  const {
    mutate,
    isPending,
    error: saveError,
  } = rqClient.useMutation("put", "/api/v1/rfid/rfid", {
    onSuccess() {
      refetch();
      toast("RFID токен обновлен");
    },
  });

  const setRfid = (data: ApiSchema["RFIDSettingsModelRequest"]) => {
    mutate({ body: data });
  };

  return {
    rfid,
    setRfid,
    isLoading,
    error,
    isPending,
    saveError,
  };
};
