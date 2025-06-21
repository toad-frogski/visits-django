import clsx from "clsx";
import type { FC, HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md";
};

const card = tv({
  base: "bg-surface shadow",
  variants: {
    size: {
      sm: "py-1 px-2",
      md: "p-4",
    },
  },
});

const Card: FC<CardProps> = ({
  children,
  className,
  size = "md",
  ...props
}) => {
  return (
    <div className={clsx(className, card({ size }))} {...props}>
      {children}
    </div>
  );
};

export default Card;
