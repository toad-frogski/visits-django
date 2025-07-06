import type { ToggleGroupState } from "react-stately";
import {
  useToggleButtonGroup,
  useToggleButtonGroupItem,
  type AriaToggleButtonGroupItemProps,
  type AriaToggleButtonGroupProps,
} from "@react-aria/button";
import { useToggleGroupState } from "react-stately";
import { createContext, useContext, useRef, type FC, type HTMLAttributes } from "react";
import Button, { type ButtonProps } from "@/shared/ui/components/button";
import { cn } from "@/shared/lib/cn";

type ToggleButtonGroupProps = AriaToggleButtonGroupProps &
  Pick<HTMLAttributes<HTMLDivElement>, "className" | "children">;

const ToggleButtonGroupContext = createContext<ToggleGroupState | null>(null);

export const ToggleButtonGroup: FC<ToggleButtonGroupProps> = ({ children, className, orientation, ...props }) => {
  const state = useToggleGroupState(props);
  const ref = useRef<HTMLDivElement | null>(null);
  const { groupProps } = useToggleButtonGroup(props, state, ref);

  return (
    <div
      {...groupProps}
      ref={ref}
      className={cn(className, "flex", orientation === "horizontal" ? "flex-row" : "flex-col")}
      aria-orientation={orientation}
    >
      <ToggleButtonGroupContext.Provider value={state}>{children}</ToggleButtonGroupContext.Provider>
    </div>
  );
};

export const ToggleButton: FC<AriaToggleButtonGroupItemProps & ButtonProps> = ({
  children,
  variant = "accent",
  icon,
  ...props
}) => {
  const ref = useRef<HTMLButtonElement | null>(null);
  const state = useContext(ToggleButtonGroupContext)!;
  const { buttonProps, isPressed, isSelected } = useToggleButtonGroupItem(props, state, ref);

  return (
    <Button
      {...buttonProps}
      ref={ref}
      data-pressed={isPressed}
      data-selected={isSelected}
      variant={isSelected ? variant : "white"}
      icon={icon}
    >
      {children}
    </Button>
  );
};
