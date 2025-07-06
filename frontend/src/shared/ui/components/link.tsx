import { cn } from "@/shared/lib/cn";
import type { FC } from "react";
import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from "react-router";

type LinkProps = RouterLinkProps & {
  variant?: "default" | "green" | "orange" | "red" | "yellow" | "blue";
};

const Link: FC<LinkProps> = ({ className, children, variant, ...props }) => {
  return (
    <RouterLink
      className={cn(
        className,
        "p-3 rounded transition-colors duration-200 text-background",
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
    </RouterLink>
  );
};

export default Link;
