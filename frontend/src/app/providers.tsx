import { queryClient } from "@/shared/api/query-client";
import { ThemeProvider } from "@/shared/components/ui/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import type { FC, PropsWithChildren } from "react";

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
};

export default Providers;
