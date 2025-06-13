import type { FC } from "react";
import Link from "../../ui/components/link";

const HomeMain: FC = () => {
  return (
    <div className="flex gap-3">
      <Link className="flex-1 text-center font-bold" to={"visits"}>Отметиться</Link>
      <Link className="flex-1 text-center font-bold" variant="green" to={""}>Посмотреть отчет</Link>
    </div>
  );
};

export default HomeMain;
