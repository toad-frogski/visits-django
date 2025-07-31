import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { useSession } from "@/shared/model/session";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import z from "zod";

export const useLogin = () => {
  const navigate = useNavigate();
  const [t] = useTranslation(["common", "auth"]);

  const schema = useMemo(
    () =>
      z.object({
        username: z
          .string({
            required_error: t("auth:errors.validation.username"),
          })
          .trim()
          .nonempty(t("auth:errors.validation.username")),
        password: z
          .string({
            required_error: t("auth:errors.validation.password"),
          })
          .trim()
          .nonempty(t("auth:errors.validation.password")),
      }),
    [t]
  );

  const setUser = useSession((state) => state.setUser);
  const { mutate, isPending, error } = rqClient.useMutation("post", "/api/v1/session/login", {
    onSuccess(data) {
      setUser(data);
      navigate("/");
    },
  });

  const login = (data: ApiSchema["LoginRequest"]) => mutate({ body: data });

  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = form.handleSubmit(login);

  return {
    form,
    onSubmit,
    isPending: isPending,
    error: error,
  };
};
