import { rqClient } from "@/shared/api/instance";

export const useRedmineTimer = () => {
  const { data } = rqClient.useQuery("get", "/api/v1/visits/plugins/redmine/spend-time", undefined, {
    refetchInterval: 1000 * 60,
  });

  const current = (data?.hours || 0) * 60 * 60 * 1000;

  return { current };
};
