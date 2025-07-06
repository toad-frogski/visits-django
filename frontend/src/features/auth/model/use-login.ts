import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { useNavigate } from "react-router";

export const useLogin = () => {
  const navigate = useNavigate();

  const setUser = useSession((state) => state.setUser);
  const loginMutation = rqClient.useMutation("post", "/api/v1/session/login", {
    onSuccess(data) {
      setUser(data);
      navigate(ROUTES.HOME);
    },
  });

  const login = (data: ApiSchema["LoginRequest"]) =>
    loginMutation.mutate({ body: data });

  const rawError = loginMutation.isError ? loginMutation.error : undefined;
  const errorMessage =
    rawError && "data" in rawError
      ? Array.isArray(rawError.data?.non_field_errors)
        ? rawError.data.non_field_errors.join(" ")
        : rawError.data?.detail ?? null
      : null;

  return {
    login,
    isPending: loginMutation.isPending,
    error: errorMessage,
  };
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearUser = useSession((state) => state.clearUser);

  const mutation = rqClient.useMutation("post", "/api/v1/session/logout", {
    onSuccess() {
      clearUser();
      navigate(ROUTES.HOME);
    },
  });

  const logout = () => mutation.mutate({});

  return {
    logout,
    isPending: mutation.isPending,
    error: mutation.isError ? mutation.error : undefined,
  };
};
