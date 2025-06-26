import { cn } from "@/lib/cn";
import type { FC } from "react";
import {
  type DisclosureProps as AriaDisclosureProps,
  type ButtonProps as AriaButtonProps,
  Disclosure as AriaDisclosure,
  DisclosurePanel as AriaDisclosurePanel,
  Button,
  type DisclosurePanelProps as AriaDisclosurePanelProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";

const disclosure = tv({
  slots: {
    base: "w-full bg-surface relative before:top-0 before:left-0 before:h-full before:w-4 before:bg-transparent before:absolute before:transition-colors before:duration-200 before:ease-in-out",
    trigger:
      "w-full outline-none py-2 px-4 pl-6 hover:bg-accent/10 focus-visible:bg-accent/10 transition-colors duration-200 ease-in-out",
    content: "pl-6 pr-2 aria-hidden:hidden",
  },
  variants: {
    active: {
      true: {
        base: "before:bg-accent",
      },
      false: {
        base: "before:bg-gray-light/20",
      },
    },
    disabled: {
      true: {
        trigger: "cursor-default pointer-events-none",
      },
      false: {
        trigger: "cursor-pointer",
      },
    },
  },
});

const Disclosure: FC<AriaDisclosureProps> = ({ children, className, isExpanded, isDisabled, ...props }) => {
  const { base } = disclosure();

  return (
    <AriaDisclosure
      className={({ isExpanded, isDisabled }) => cn(className, base({ active: isExpanded, disabled: isDisabled }))}
      {...props}
      isDisabled={isDisabled}
      isExpanded={isExpanded}
    >
      {children}
    </AriaDisclosure>
  );
};

export const DisclosureTrigger: FC<AriaButtonProps> = ({ children, className, isDisabled, ...props }) => {
  const { trigger } = disclosure();

  return (
    <Button
      {...props}
      slot="trigger"
      className={({ isDisabled }) => cn(className, trigger({ disabled: isDisabled }))}
      isDisabled={isDisabled}
    >
      {children}
    </Button>
  );
};

export const DisclosurePanel: FC<AriaDisclosurePanelProps> = ({ className, children, ...props }) => {
  const { content } = disclosure();

  return (
    <AriaDisclosurePanel className={cn(className, content())} {...props}>
      {children}
    </AriaDisclosurePanel>
  );
};

export default Disclosure;
