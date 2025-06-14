import { type FC } from "react";
import Button from "@/ui/components/button";
import useAuthStore from "@/stores/auth";
import { VisitsApi } from "@/lib/api";
import client from "@/lib/api-client";

import Pause from "@/assets/pause.svg?react";
import Play from "@/assets/play.svg?react";
import Stop from "@/assets/square.svg?react";
import Leaf from "@/assets/leaf.svg?react";
import Soup from "@/assets/soup.svg?react";

const api = new VisitsApi(undefined, undefined, client);

const Visits: FC = () => {
  const session = useAuthStore((state) => state.session);
  const fetchSession = useAuthStore((state) => state.fetchSession);

  return (
    <div className="flex flex-col gap-3 max-w-48">
      <Button icon={Play}>Начать</Button>
      <Button icon={Pause}>Отлучиться</Button>
      <Button icon={Stop}>Завершить</Button>
      <Button variant="green" icon={Leaf}>Перерыв</Button>
      <Button variant="green" icon={Soup}>Обед</Button>
    </div>
  );


  // switch (session?.status) {

  //   case "active":
  //     return (
  //       <div className="flex gap-12">
  //         <Button disabled>Отлучиться</Button>
  //         <Button
  //           onClick={() => {
  //             api.exit().finally(() => fetchSession());
  //           }}
  //         >
  //           Выйти
  //         </Button>
  //       </div>
  //     );

  //   case "inactive":
  //   default:
  //     return (
  //       <div>
  //         <Button
  //           onClick={() => {
  //             api.enter({ type: "WORK" }).finally(() => fetchSession());
  //           }}
  //         >
  //           Войти
  //         </Button>
  //       </div>
  //     );
  // }
};

export default Visits;
