"use client"

import Image from "next/image";
import { ButtonHTMLAttributes, FC } from "react";
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from "next-auth/react";
import clsx from "clsx";
import useDesktop from "@/lib/hooks/useDesktop";

const Sidebar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useDesktop();

  if (!isDesktop) return null;


  const navItems = [
    { label: "General", href: "/", icon: "/icons/grid.svg" },
    { label: "Shedule", href: "/shedule", icon: "/icons/clock.svg" },
    { label: "Settings", href: "/settings", icon: "/icons/settings.svg" },
    { label: "Requests", href: "/requests", icon: "/icons/folder-plus.svg" },
    { label: "Calendar", href: "/calendar", icon: "/icons/calendar.svg" },
  ];

  return (
    <div className="flex flex-col py-14 text-h3/h3 font-bold text-gray relative">
      <div className="mx-12">
        <Image src={"/logo.png"} alt="Logo" width={200} height={60} />
      </div>
      <div className="flex-1 mt-24">
        <nav>
          <ul className="flex flex-col ml-12">
            {navItems.map((item) => {
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <SidebarBreadcrumb
                    className="py-6 w-full"
                    icon={item.icon}
                    label={item.label}
                    active={active}
                    onClick={() => router.push(item.href)}
                  />
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <SidebarBreadcrumb
        className="ml-12"
        icon="/icons/log-out.svg"
        label="Sign out"
        onClick={() => signOut()}
      />
    </div>
  )
}

type SidebarBreadcrumbProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  icon: string,
  label: string,
};

const SidebarBreadcrumb: FC<SidebarBreadcrumbProps> = ({ active, icon, label, className, ...props }) => {
  return (
    <button
      className={clsx("flex items-center cursor-pointer group w-full", className)}
      {...props}
    >
      <span
        className={clsx(
          "absolute -z-1 right-0 w-full max-w-[calc(100%-20px)] h-full max-h-[64px] rounded-l-4xl bg-gray-light transition-opacity",
          "group-hover:opacity-60",
          active ? "opacity-100 group-hover:opacity-100" : "opacity-0",
        )}
      />
      <Image src={icon} width={24} height={24} alt={label} />
      <span className="ml-3">{label}</span>
    </button>
  );
}

export default Sidebar;