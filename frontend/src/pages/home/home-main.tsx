import type { FC } from "react";
import Link from "../../ui/components/link";

const HomeMain: FC = () => {
  return (
    <div className="flex gap-3">
      <Link to={"visits"}>Отметиться</Link>
      <Link to={""}>Посмотреть отчет</Link>
    </div>
  )
}

export default HomeMain;
