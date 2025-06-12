import clsx from "clsx";
import type { FC, HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

const Card: FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={clsx(className, "w-full px-4 py-6 rounded-3xl bg-surface shadow")} {...props}>
      {children}
    </div>
  );
};

export default Card;
