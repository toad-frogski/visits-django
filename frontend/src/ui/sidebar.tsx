"use client"

import Image from "next/image";
import { FC } from "react";
import { redirect, useRouter } from 'next/navigation'
import { signOut } from "next-auth/react";

const Sidebar: FC = () => {
  const router = useRouter();

  return <div className="flex flex-col px-12 py-14 text-h3/h3 font-bold text-gray">
    <div>
      <Image src={"/logo.png"} alt="Logo" width={140} height={60} />
    </div>
    <div className="flex-1 mt-24">
      <nav>
        <ul className="flex flex-col gap-y-10">
          <li>
            <div className="flex" onClick={() => router.push("/")}>
              <Image src={"/icons/grid.svg"} width={24} height={24} alt="grid" />
              <span className="ml-3">General</span>
            </div>
          </li>
          <li>
            <div className="flex">
              <Image src={"/icons/clock.svg"} width={24} height={24} alt="grid" />
              <span className="ml-3">Shedule</span>
            </div>
          </li>
          <li>
            <div className="flex">
              <Image src={"/icons/settings.svg"} width={24} height={24} alt="grid" />
              <span className="ml-3">Settings</span>
            </div>
          </li>
          <li>
            <div className="flex">
              <Image src={"/icons/folder-plus.svg"} width={24} height={24} alt="grid" />
              <span className="ml-3">Requests</span>
            </div>
          </li>
          <li>
            <div className="flex">
              <Image src={"/icons/calendar.svg"} width={24} height={24} alt="grid" />
              <span className="ml-3">Calendar</span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
    <div className="flex" onClick={() => signOut()}>
      <Image src={"/icons/log-out.svg"} width={24} height={24} alt="grid" />
      <span className="ml-3">Sign out</span>
    </div>
  </div>
}

export default Sidebar;