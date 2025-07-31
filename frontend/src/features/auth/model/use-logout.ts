import { rqClient } from "@/shared/api/instance";
import { useSession } from "@/shared/model/session";
import { useNavigate } from "react-router-dom";

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
