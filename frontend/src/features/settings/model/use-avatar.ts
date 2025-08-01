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

  const setAvatar = (data: any) => mutate({ body: data });

  return { avatar: data?.avatar, setAvatar, isPending, error: error };
}
