import { rqClient } from "@/shared/api/instance";
import type { ApiSchema } from "@/shared/api/schema";
import { useSession } from "@/shared/model/session";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const navigate = useNavigate();

  const setUser = useSession((state) => state.setUser);
  const {mutate, isPending, error} = rqClient.useMutation("post", "/api/v1/session/login", {
    onSuccess(data) {
      setUser(data);
      navigate("/");
    },
  });

  const login = (data: ApiSchema["LoginRequest"]) => mutate({ body: data });

  return {
    login,
    isPending: isPending,
    error: error,
  };
};

export const useLogout = () => {
  const navigate = useNavigate();
  const clearUser = useSession((state) => state.clearUser);

  const mutation = rqClient.useMutation("post", "/api/v1/session/logout", {
    onSuccess() {
      clearUser();
      navigate("/");
    },
  });

  const logout = () => mutation.mutate({});

  return {
    logout,
    isPending: mutation.isPending,
    error: mutation.isError ? mutation.error : undefined,
  };
};
