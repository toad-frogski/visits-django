import clsx from "clsx";
import type { ButtonHTMLAttributes, FC } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "green" | "orange" | "red" | "yellow" | "blue";
};

const Button: FC<ButtonProps> = ({ variant, children, className, ...props }) => {
  return (
    <button
      className={clsx(
        className,
        "p-3 rounded-md w-full text-background disabled:bg-gray-light disabled:text-surface cursor-pointer",
        "transition-all duration-200 ease-in-out",
        {
          "bg-accent hover:bg-accent-light": variant === "default" || !variant,
          "bg-green hover:bg-green-light": variant === "green",
          "bg-orange hover:bg-orange-light": variant === "orange",
          "bg-red hover:bg-red-light": variant === "red",
          "bg-yellow hover:bg-yellow-light": variant === "yellow",
          "bg-blue hover:bg-blue-light": variant === "blue",
        }
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button;