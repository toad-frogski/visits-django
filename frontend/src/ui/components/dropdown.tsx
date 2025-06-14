import clsx from "clsx";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type FC, type HTMLAttributes, type ReactElement, type SVGProps } from "react";
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [])

  return (
    <div {...props} ref={ref} className="relative inline-block text-left">
      <button onClick={toggleMenu}>{button}</button>
      {open && (
        <div className={clsx(className, "absolute z-10")}>
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
        className={clsx(className, "flex gap-3 cursor-pointer hover:bg-background p-3 w-full")}
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
        className={clsx(className, "flex gap-3 cursor-pointer hover:bg-background p-3 w-full")}
      >
        {children}
      </button>
    </li>
  )
}

export default Dropdown;