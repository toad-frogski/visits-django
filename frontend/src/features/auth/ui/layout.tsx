import { Card, CardContent } from "@/shared/components/ui/card";
import type { FC, PropsWithChildren } from "react";

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 md:justify-center md:items-center flex">
        <Card className="w-full md:max-w-[450px]">
          <CardContent className="mt-15 md:mt-0">{children}</CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Layout;
