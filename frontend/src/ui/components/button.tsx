import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, FC, ReactNode, SVGProps } from "react";
import {
  type ToggleButtonProps as AriaToggleButtonProps,
  ToggleButton as AriaToggleButton,
} from "react-aria-components";
import { tv } from "tailwind-variants";

type ButtonVisualProps = {
  variant?: "accent" | "green" | "orange" | "red" | "yellow" | "blue" | "white";
  icon?: FC<SVGProps<SVGSVGElement>>;
  iconPosition?: "left" | "right" | "left-edge" | "right-edge";
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVisualProps;

const button = tv({
  base: "p-3 rounded-md w-full text-background font-bold cursor-pointer transition-all duration-200 ease-in-out",
  variants: {
    color: {
      white: "bg-surface border border-gray-light hover:bg-background text-gray *:stroke-gray",
      accent: "bg-accent hover:bg-accent-light",
      green: "bg-green hover:bg-green-light",
      orange: "bg-orange hover:bg-orange-light",
      red: "bg-red hover:bg-red-light",
      yellow: "bg-yellow hover:bg-yellow-light",
      blue: "bg-blue hover:bg-blue-light",
    },
    disabled: {
      true: "text-surface bg-gray-light",
    },
    icon: {
      true: "flex gap-3",
    },
    iconPosition: {
      left: "justify-center",
      right: "justify-center flex-row-reverse",
      "left-edge": "justify-between",
      "right-edge": "justify-between flex-row-reverse",
    },
  },
  defaultVariants: {
    color: "accent",
  },
});

const Button: FC<ButtonProps> = ({
  variant = "accent",
  children,
  className,
  icon: Icon,
  iconPosition = "right-edge",
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        button({
          color: variant,
          disabled,
          icon: !!Icon,
          iconPosition: Icon ? iconPosition : undefined,
        }),
        className
      )}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className="*:stroke-background" />}
      {children}
    </button>
  );
};

export const ToggleButton: FC<AriaToggleButtonProps & ButtonVisualProps> = ({
  className,
  children,
  isDisabled,
  variant = "accent",
  icon: Icon,
  iconPosition = "right-edge",
  ...props
}) => {
  return (
    <AriaToggleButton
      {...props}
      isDisabled={isDisabled}
      className={cn(
        className,
        button({
          color: isSelected ? variant : "white",
          disabled: isDisabled,
          icon: !!Icon,
          iconPosition: Icon ? iconPosition : undefined,
        })
      )}
    >
      {Icon && <Icon className="*:stroke-background" />}
      {children}
    </AriaToggleButton>
  );
};

export default Button;
