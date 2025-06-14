import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, FC, SVGProps } from "react";
import { tv } from "tailwind-variants";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "accent" | "green" | "orange" | "red" | "yellow" | "blue";
  icon?: FC<SVGProps<SVGSVGElement>>;
  iconPosition?: "left" | "right" | "left-edge" | "right-edge";
};

const button = tv({
  base: "p-3 rounded-md w-full text-background font-bold cursor-pointer transition-all duration-200 ease-in-out",
  variants: {
    color: {
      accent: "bg-accent hover:bg-accent-light",
      green: "bg-green hover:bg-green-light",
      orange: "bg-orange hover:bg-orange-light",
      red: "bg-red hover:bg-red-light",
      yellow: "bg-yellow hover:bg-yellow-light",
      blue: "bg-blue hover:bg-blue-light",
    },
    disabled: {
      true: "text-surface bg-gray-light pointer-events-none"
    },
    icon: {
      true: "flex gap-3"
    },
    iconPosition: {
      left: "justify-center",
      right: "justify-center flex-row-reverse",
      "left-edge": "justify-between",
      "right-edge": "justify-between flex-row-reverse",
    },
  },
  defaultVariants: {
    color: "accent"
  }
})

const Button: FC<ButtonProps> = ({ variant = "accent", children, className, icon: Icon, iconPosition = "right-edge", disabled, ...props }) => {
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
  )
}

export default Button;