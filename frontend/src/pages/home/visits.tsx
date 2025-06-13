import { type FC } from "react";
import Button from "../../ui/components/button";
import useAuthStore from "../../stores/auth";
import { VisitsApi } from "../../lib/api";
import client from "../../lib/api-client";

const api = new VisitsApi(undefined, undefined, client);

const Visits: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);


  switch (session?.status) {

    case "active":
      return (
        <div className="flex gap-12 ">
          <Button disabled>Отлучиться</Button>
          <Button
            onClick={() => {
              api.exit().finally(() => fetchSession());
            }}
          >
            Выйти
          </Button>
        </div>
      );

    case "inactive":
    default:
      return (
        <div>
          <Button
            onClick={() => {
              api.enter({ type: "WORK" }).finally(() => fetchSession());
            }}
          >
            Войти
          </Button>
        </div>
      );
  }
};

export default Visits;
