import { rqClient } from "@/shared/api/instance";

export const useSelectUser = () => {
  const { data: users } = rqClient.useQuery("get", "/api/v1/visits/users");

  return { users };
};
