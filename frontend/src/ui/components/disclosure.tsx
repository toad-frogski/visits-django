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
    base: "w-full bg-surface mb-3 bg-gradient-to-r from-[16px] from-background via-surface via-[16px] shadow data-expanded:from-accent rounded overflow-hidden duration-200 transition-colors ease-in-out",
    trigger: "w-full cursor-pointer pr-2 py-2 pl-6 hover:bg-accent-light/20 duration-200 ease-in-out transition-colors",
    content: "pl-6 pr-2",
  },
});

const Disclosure: FC<AriaDisclosureProps> = ({ children, className, ...props }) => {
  const { base } = disclosure();

  return (
    <AriaDisclosure className={cn(className, base())} {...props}>
      {children}
    </AriaDisclosure>
  );
};

export const DisclosureTrigger: FC<AriaButtonProps> = ({ children, className, ...props }) => {
  const { trigger } = disclosure();

  return (
    <Button {...props} slot="trigger" className={cn(className, trigger())}>
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
