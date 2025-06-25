import { cn } from "@/lib/cn";
import { forwardRef, type ButtonHTMLAttributes, type FC, type SVGProps } from "react";
import { tv } from "tailwind-variants";

type ButtonVisualProps = {
  variant?: "accent" | "green" | "orange" | "red" | "yellow" | "blue" | "white";
  icon?: FC<SVGProps<SVGSVGElement>>;
  iconPosition?: "left" | "right" | "left-edge" | "right-edge";
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonVisualProps;

const button = tv({
  slots: {
    base: "p-3 rounded-md w-full text-background font-bold cursor-pointer transition-all duration-200 ease-in-out",
    icon: "",
  },
  variants: {
    color: {
      white: {
        base: "bg-surface hover:bg-background text-gray",
        icon: "*:stroke-gray",
      },
      accent: {
        base: "bg-accent hover:bg-accent-light",
        icon: "*:stroke-background",
      },
      green: {
        base: "bg-green hover:bg-green-light",
        icon: "*:stroke-background",
      },
      orange: {
        base: "bg-orange hover:bg-orange-light",
        icon: "*:stroke-background",
      },
      red: {
        base: "bg-red hover:bg-red-light",
        icon: "*:stroke-background",
      },
      yellow: {
        base: "bg-yellow hover:bg-yellow-light",
        icon: "*:stroke-background",
      },
      blue: {
        base: "bg-blue hover:bg-blue-light",
        icon: "*:stroke-background",
      },
    },
    disabled: {
      true: {
        base: "text-surface bg-gray-light cursor-default hover:bg-gray-light",
      },
    },
    withIcon: {
      true: {
        base: "flex gap-3",
      },
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "accent", children, className, icon: Icon, iconPosition = "right-edge", disabled, ...props }, ref) => {
    const { base, icon } = button({
      color: variant,
      disabled,
      withIcon: !!Icon,
      iconPosition: Icon ? iconPosition : undefined,
    });
    return (
      <button ref={ref} className={cn(base(), className)} disabled={disabled} {...props}>
        {Icon && <Icon className={icon()} />}
        {children}
      </button>
    );
  }
);

export default Button;
