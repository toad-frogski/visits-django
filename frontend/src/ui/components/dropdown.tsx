import { cn } from "@/lib/cn";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type FC, type HTMLAttributes, type ReactElement } from "react";
import { NavLink, type NavLinkProps } from "react-router";

type DropdownProps = HTMLAttributes<HTMLDivElement> & {
  button: ReactElement;
}

const Dropdown: FC<DropdownProps> = ({ children, className, button, ...props }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref?.current?.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [])

  return (
    <div {...props} ref={ref} className="relative inline-block text-left">
      <button onClick={toggleMenu}>{button}</button>
      {open && (
        <div className={cn(className, "absolute z-10")}>
          <ul>
            {children}
          </ul>
        </div>
      )}
    </div>)
}

export const DropdownItem: FC<NavLinkProps> = ({ children, className, ...props }) => {
  return (
    <li>
      <NavLink
        {...props}
        className={cn(className, "flex gap-3 cursor-pointer hover:bg-background p-3 w-full")}
      >
        {children}
      </NavLink>
    </li>
  );
}

export const DropdownButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <li>
      <button
        {...props}
        className={cn(className, "flex gap-3 cursor-pointer hover:bg-background p-3 w-full")}
      >
        {children}
      </button>
    </li>
  )
}

export default Dropdown;