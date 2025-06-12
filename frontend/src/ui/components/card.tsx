import clsx from "clsx";
import type { FC, HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

const Card: FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={clsx(className, "w-full p-4 rounded-3xl bg-surface shadow")} {...props}>
      {children}
    </div>
  );
};

export default Card;
