import { getServerSession } from "next-auth";
import { FC, PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

const ProtectedLayout: FC<PropsWithChildren> = async ({ children }) => {
    const session = await getSession();

    if (!session) {
        redirect('/sign-in');
    }

    return children;
}

export default ProtectedLayout;