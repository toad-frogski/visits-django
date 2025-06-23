import { RedmineApi } from "@/lib/api";
import client from "@/lib/api-client";
import useAuthStore from "@/stores/auth";
import { TimerBlock } from "@/ui/widgets/timer";
import { useEffect, useState, type FC } from "react";

const api = new RedmineApi(undefined, undefined, client);

const RedmineTimer: FC = () => {
  const [hours, setHours] = useState(0);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    api.spentToday().then(({ data }) => setHours(data?.hours ?? 0));
  }, [session]);

  return <TimerBlock current={hours * 60 * 60 * 1000} total={8 * 60 * 60 * 1000} color="green" />;
};

export default RedmineTimer;
