import { FC, PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/ui/sidebar";

const ProtectedLayout: FC<PropsWithChildren> = async ({ children }) => {
    const session = await getSession();

    if (!session) {
        redirect('/sign-in');
    }

    return (
        <div className="min-h-screen flex">
            <Sidebar />
            <main className="flex-1">
            {children}
            </main>
        </div>
    );
}

export default ProtectedLayout;