import { cn } from "@/lib/cn";
import {
  cloneElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type HTMLAttributes,
  type PropsWithChildren,
} from "react";
import { tv } from "tailwind-variants";

const DropdownContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  position?: "bottom" | "top" | "left" | "right";
} | null>(null);

const dropdown = tv({
  slots: {
    content: "absolute bg-white border-gray-light border rounded overflow-hidden",
  },
  variants: {
    position: {
      top: {
        content: "bottom-full mb-2",
      },
      bottom: {
        content: "top-full mt-2",
      },
      left: {
        content: "right-full mr-2",
      },
      right: {
        content: "left-full ml-2",
      }
    },
  },
});

type DropdownProps = HTMLAttributes<HTMLElement> & {
  position?: "bottom" | "top" | "left" | "right";
};

const Dropdown: FC<DropdownProps> = ({
  children,
  position = "bottom",
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const focusables = dropdownRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const items = Array.from(focusables ?? []);
      const index = items.indexOf(document.activeElement as HTMLElement);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        items[(index + 1) % items.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        items[(index - 1 + items.length) % items.length]?.focus();
      } else if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <DropdownContext.Provider
      value={{ isOpen, toggle, close, buttonRef, dropdownRef, position }}
    >
      <div className={cn("relative inline-block", className)} {...props}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

type DropdownTriggerProps = PropsWithChildren;

export const DropdownTrigger: FC<DropdownTriggerProps> = ({ children }) => {
  const ctx = useContext(DropdownContext);
  if (!ctx) return null;
  if (!children) return null;

  return (
    <div onClick={ctx.toggle}>
      {cloneElement(children, {
        ref: ctx.buttonRef,
        role: "button",
        tabIndex: 0,
      })}
    </div>
  );
};

export const DropdownContent: FC<HTMLAttributes<HTMLElement>> = ({
  className,
  children,
}) => {
  const ctx = useContext(DropdownContext);
  if (!ctx || !ctx.isOpen) return null;

  const { content } = dropdown({ position: ctx.position });

  return (
    <div ref={ctx.dropdownRef} className={cn(className, content())}>
      {children}
    </div>
  );
};

type DropdownItemProps = {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

export const DropdownItem: FC<DropdownItemProps> = ({
  onClick,
  children,
  className,
}) => {
  const ctx = useContext(DropdownContext);
  if (!ctx) return null;

  const handleClick = () => {
    onClick?.();
    ctx?.close();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-2 bg-surface hover:bg-background focus:outline-0 focus:bg-background",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Dropdown;
