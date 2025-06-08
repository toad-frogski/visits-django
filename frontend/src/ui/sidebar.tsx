"use client"

import Image from "next/image";
import { FC } from "react";
import { redirect, usePathname, useRouter } from 'next/navigation'
import { signOut } from "next-auth/react";

const Sidebar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "General", href: "/", icon: "/icons/grid.svg" },
    { label: "Shedule", href: "/shedule", icon: "/icons/clock.svg" },
    { label: "Settings", href: "/settings", icon: "/icons/settings.svg" },
    { label: "Requests", href: "/requests", icon: "/icons/folder-plus.svg" },
    { label: "Calendar", href: "/calendar", icon: "/icons/calendar.svg" },
  ];

  return <div className="flex flex-col px-12 py-14 text-h3/h3 font-bold text-gray relative">
    <div>
      <Image src={"/logo.png"} alt="Logo" width={140} height={60} />
    </div>
    <div className="flex-1 mt-24">
      <nav>
        <ul className="flex flex-col gap-10">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <span className="absolute -z-1 right-0 w-full max-w-[220px] h-full max-h-[64px] rounded-l-4xl bg-gray-light" />
                  <Image src={item.icon} width={24} height={24} alt={item.label} />
                  <span className="ml-3">{item.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
    <div className="flex" onClick={() => signOut()}>
      <span className="absolute -z-1 right-0 w-full max-w-[220px] h-full max-h-[64px] rounded-l-4xl bg-gray-light" />
      <Image src={"/icons/log-out.svg"} width={24} height={24} alt="grid" />
      <span className="ml-3">Sign out</span>
    </div>
  </div>
}

export default Sidebar;