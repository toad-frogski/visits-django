import { rqClient } from "@/shared/api/instance";
import { useSession } from "@/shared/model/session";

export default function useAvatar() {
  const { data, refetch } = rqClient.useQuery("get", "/api/v1/session/me");
  const fetchUser = useSession((state) => state.fetchUser);

  const { mutate, isPending, error } = rqClient.useMutation(
    "put",
    "/api/v1/session/avatar",
    {
      onSuccess() {
        fetchUser();
        refetch();
      },
    }
  );

  const setAvatar = (data) => mutate({ body: data });

  const parseError = (error: unknown) => {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (
      typeof error === "object" &&
      "avatar" in error &&
      error.avatar instanceof Array
    )
      return error.avatar[0];
    if (error instanceof Error) return error.message;

    return "Unknown error";
  };

  const errorMessage = parseError(error);

  return { avatar: data?.avatar, setAvatar, isPending, error: errorMessage };
}
